import { afterEach, describe, expect, it, vi } from "vitest";
import { flushSync } from "svelte";
import { waitFor } from "@testing-library/svelte";
import { expand, type ExpandParams } from "./expand.svelte.ts";

type Viewport = { wide?: boolean; below?: boolean; reduce?: boolean };

// jsdom evaluates no media queries, so each test states which ones match;
// `resize` restates them and fires `change`.
function viewport(initial: Viewport = {}) {
  const state = { wide: false, below: false, reduce: false, ...initial };
  const listeners = new Set<(event: Event) => void>();
  const answer = (query: string) =>
    query.includes("prefers-reduced-motion")
      ? state.reduce
      : query === "(min-width: 64rem)"
      ? !state.below
      : state.wide;

  globalThis.matchMedia = vi.fn((query: string) => ({
    get matches() {
      return answer(query);
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, fn: (event: Event) => void) =>
      listeners.add(fn),
    removeEventListener: (_type: string, fn: (event: Event) => void) =>
      listeners.delete(fn),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof globalThis.matchMedia;

  return {
    resize(next: Viewport) {
      Object.assign(state, next);
      for (const fn of listeners) fn(new Event("change"));
      flushSync();
    },
  };
}

const pointer = (type: string, pointerType = "mouse") =>
  Object.assign(new Event(type, { bubbles: true }), { pointerType });

let teardown: (() => void) | undefined;

// Runs the attachment the way {@attach} does: inside an effect.
function mount(
  params: () => ExpandParams | undefined = () => undefined,
): HTMLElement {
  const node = document.createElement("nav");
  document.body.append(node);
  teardown = $effect.root(() => {
    $effect(() => expand(params)(node));
  });
  flushSync();
  return node;
}

afterEach(() => {
  teardown?.();
  teardown = undefined;
  document.body.replaceChildren();
});

describe("expand", () => {
  it("settles at the collapsed width on mount, with no animation", () => {
    viewport();
    expect(mount().style.width).toBe("64px");
  });

  it("pins expanded when `open` is set", () => {
    viewport();
    expect(mount(() => ({ open: true })).style.width).toBe("256px");
  });

  it("pins expanded at and above wideAt", () => {
    viewport({ wide: true });
    expect(mount().style.width).toBe("256px");
  });

  it("writes no inline width below disableBelow", () => {
    viewport({ below: true });
    expect(mount().style.width).toBe("");
  });

  it("queries lg in rem, as the CSS does", () => {
    viewport();
    mount();
    expect(globalThis.matchMedia).toHaveBeenCalledWith("(min-width: 64rem)");
  });

  it("sizes rem widths by the root font size, as the CSS does", () => {
    viewport();
    const root = document.documentElement.style;
    const before = root.fontSize;
    root.fontSize = "20px";
    try {
      expect(mount().style.width).toBe("80px");
    } finally {
      root.fontSize = before;
    }
  });

  it("springs to the expanded width on hover", async () => {
    viewport();
    const node = mount();
    node.dispatchEvent(pointer("pointerenter"));
    await waitFor(() => expect(node.style.width).toBe("256px"), {
      timeout: 2000,
    });
  });

  it("returns to the collapsed width on pointer leave", async () => {
    viewport();
    const node = mount();
    node.dispatchEvent(pointer("pointerenter"));
    await waitFor(() => expect(node.style.width).toBe("256px"), {
      timeout: 2000,
    });
    node.dispatchEvent(pointer("pointerleave"));
    await waitFor(() => expect(node.style.width).toBe("64px"), {
      timeout: 2000,
    });
  });

  it("ignores a touch tap, which has no real hover", () => {
    // Reduced motion snaps synchronously, so a missing guard would show at once.
    viewport({ reduce: true });
    const node = mount();
    node.dispatchEvent(pointer("pointerenter", "touch"));
    expect(node.style.width).toBe("64px");
  });

  it("snaps without animating under prefers-reduced-motion", () => {
    viewport({ reduce: true });
    const node = mount();
    node.dispatchEvent(pointer("pointerenter"));
    expect(node.style.width).toBe("256px");
  });

  it("expands on focus-within and collapses when focus leaves", async () => {
    viewport();
    const node = mount();
    node.dispatchEvent(new Event("focusin", { bubbles: true }));
    await waitFor(() => expect(node.style.width).toBe("256px"), {
      timeout: 2000,
    });
    node.dispatchEvent(
      Object.assign(new Event("focusout", { bubbles: true }), {
        relatedTarget: document.body,
      }),
    );
    await waitFor(() => expect(node.style.width).toBe("64px"), {
      timeout: 2000,
    });
  });

  it("springs in place when `open` changes", async () => {
    viewport();
    const params = $state<ExpandParams>({ open: false });
    const node = mount(() => params);
    params.open = true;
    flushSync();
    // A re-run attachment would have snapped to 256px here.
    expect(node.style.width).toBe("64px");
    await waitFor(() => expect(node.style.width).toBe("256px"), {
      timeout: 2000,
    });
  });

  it("springs in place when the viewport crosses wideAt", async () => {
    const mq = viewport();
    const node = mount();
    mq.resize({ wide: true });
    expect(node.style.width).toBe("64px");
    await waitFor(() => expect(node.style.width).toBe("256px"), {
      timeout: 2000,
    });
  });

  it("releases the inline width when the viewport drops below disableBelow mid-spring", async () => {
    const mq = viewport();
    const node = mount();
    node.dispatchEvent(pointer("pointerenter"));
    await waitFor(() => {
      const width = parseFloat(node.style.width);
      expect(width).toBeGreaterThan(64);
      expect(width).toBeLessThan(256);
    });

    mq.resize({ below: true });
    expect(node.style.width).toBe("");

    // The interrupted spring must not write one last frame over the release.
    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(node.style.width).toBe("");
  });

  it("releases the inline width on destroy", () => {
    viewport();
    const node = mount();
    expect(node.style.width).toBe("64px");
    teardown?.();
    teardown = undefined;
    expect(node.style.width).toBe("");
  });

  it("is inert where matchMedia is absent", () => {
    const original = globalThis.matchMedia;
    // @ts-expect-error: a partial DOM
    delete globalThis.matchMedia;
    try {
      expect(mount().style.width).toBe("");
    } finally {
      globalThis.matchMedia = original;
    }
  });
});
