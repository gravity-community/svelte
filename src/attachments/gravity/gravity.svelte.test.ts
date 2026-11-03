import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gravity } from "./gravity.svelte.ts";
import type { GravityOptions, GravityParameter } from "./types.ts";

let teardown: (() => void) | undefined;

function host(): HTMLElement {
  const node = document.createElement("button");
  document.body.append(node);
  return node;
}

// Runs the attachment the way {@attach} does: inside an effect.
function attach(node: HTMLElement, parameter: () => GravityParameter) {
  teardown = $effect.root(() => {
    $effect(() => gravity(parameter)(node));
  });
  flushSync();
}

const destroy = () => {
  teardown?.();
  teardown = undefined;
};

// jsdom lays every box out at the origin, so this pointer rests on the element.
const hover = () =>
  dispatchEvent(new PointerEvent("pointermove", { clientX: 0, clientY: 0 }));

const frames = () => new Promise((resolve) => setTimeout(resolve, 100));

beforeEach(() => {
  // A fine hover pointer and no reduced motion open the engine's gates.
  vi.stubGlobal("matchMedia", (media: string) => ({
    matches: media.includes("pointer: fine"),
    media,
    addEventListener() {},
    removeEventListener() {},
  }));
});

afterEach(() => {
  destroy();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe("gravity", () => {
  it("leans toward a nearby pointer", async () => {
    const node = host();
    attach(node, () => true);
    hover();
    await vi.waitFor(() =>
      expect(node.style.transform).toContain("translateZ")
    );
    expect(node.style.willChange).toBe("transform");
  });

  it("stays put when the parameter is false", async () => {
    const node = host();
    attach(node, () => false);
    hover();
    await frames();
    expect(node.style.transform).toBe("");
  });

  it("eases home in place when disabled mid-hover", async () => {
    const node = host();
    const options = $state<GravityOptions>({});
    attach(node, () => options);
    hover();
    await vi.waitFor(() => expect(node.style.transform).not.toBe(""));
    options.disabled = true;
    flushSync();
    // Re-registering would have cleared the transform at once.
    expect(node.style.transform).not.toBe("");
    await vi.waitFor(() => expect(node.style.transform).toBe(""), {
      timeout: 3000,
    });
  });

  it("leaves no inline styles once destroyed", async () => {
    const node = host();
    attach(node, () => true);
    hover();
    await vi.waitFor(() => expect(node.style.transform).not.toBe(""));
    destroy();
    expect(node.style.transform).toBe("");
    expect(node.style.willChange).toBe("");
    await frames();
    expect(node.style.transform).toBe("");
  });
});
