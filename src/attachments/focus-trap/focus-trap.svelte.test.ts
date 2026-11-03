import { afterEach, describe, expect, it } from "vitest";
import { flushSync } from "svelte";
import { waitFor } from "@testing-library/svelte";
import { focusTrap, type FocusTrapParams } from "./focus-trap.svelte.ts";

let teardown: (() => void) | undefined;

function scaffold() {
  document.body.innerHTML = `
    <button id="outside">outside</button>
    <section id="host" tabindex="-1">
      <button id="a">a</button>
      <button id="b">b</button>
    </section>`;
  const byId = (id: string) => document.getElementById(id) as HTMLElement;
  return {
    host: byId("host"),
    a: byId("a"),
    b: byId("b"),
    outside: byId("outside"),
  };
}

// Runs the attachment the way {@attach} does, inside an effect; returns its live params.
function trap(node: HTMLElement, initial: FocusTrapParams = {}) {
  const params = $state(initial);
  teardown = $effect.root(() => {
    $effect(() => focusTrap(() => params)(node));
  });
  flushSync();
  return params;
}

const tab = (shiftKey = false) =>
  document.activeElement!.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Tab", shiftKey, bubbles: true }),
  );

afterEach(() => {
  teardown?.();
  teardown = undefined;
  document.body.innerHTML = "";
});

describe("focusTrap", () => {
  it("focuses the first tabbable on engage", () => {
    const { host, a } = scaffold();
    trap(host);
    expect(document.activeElement).toBe(a);
  });

  it("focuses the container itself under initialFocus: container", () => {
    const { host } = scaffold();
    trap(host, { initialFocus: "container" });
    expect(document.activeElement).toBe(host);
  });

  it("cycles Tab from the last tabbable back to the first", () => {
    const { host, a, b } = scaffold();
    trap(host);
    b.focus();
    tab();
    expect(document.activeElement).toBe(a);
  });

  it("cycles Shift+Tab from the first tabbable to the last", () => {
    const { host, b } = scaffold();
    trap(host);
    tab(true);
    expect(document.activeElement).toBe(b);
  });

  it("leaves focus alone while disabled, and engages once enabled", () => {
    const { host, a, outside } = scaffold();
    outside.focus();
    const params = trap(host, { enabled: false });
    expect(document.activeElement).toBe(outside);
    params.enabled = true;
    flushSync();
    expect(document.activeElement).toBe(a);
  });

  it("takes a changed initialFocus on the next engage", () => {
    const { host } = scaffold();
    const params = trap(host, { enabled: false });
    params.initialFocus = "container";
    params.enabled = true;
    flushSync();
    expect(document.activeElement).toBe(host);
  });

  it("lets a bits-ui layer take focus, and traps again once focus returns", () => {
    const { host, a, outside } = scaffold();
    const layer = document.body.appendChild(document.createElement("div"));
    layer.setAttribute("data-popover-content", "");
    layer.tabIndex = -1;
    // Stands in for bits-ui's FocusScope, which pulls escaped focus back into its layer.
    const scope = (event: FocusEvent) => {
      if (!layer.contains(event.target as Node)) layer.focus();
    };
    // jsdom reports a listener's stack overflow as a window error, not a throw.
    const errors: unknown[] = [];
    const onError = (event: ErrorEvent) => errors.push(event.error);
    globalThis.addEventListener("error", onError);
    trap(host);
    document.addEventListener("focusin", scope, true);
    layer.focus();
    document.removeEventListener("focusin", scope, true);
    globalThis.removeEventListener("error", onError);
    expect(errors).toEqual([]);
    expect(document.activeElement).toBe(layer);

    a.focus();
    outside.focus();
    expect(document.activeElement).toBe(a);
  });

  // focus-trap returns focus on a later task.
  it("restores the previously focused element when it disengages", async () => {
    const { host, outside } = scaffold();
    outside.focus();
    const params = trap(host, { enabled: true });
    expect(document.activeElement).not.toBe(outside);
    params.enabled = false;
    flushSync();
    await waitFor(() => expect(document.activeElement).toBe(outside));
  });

  it("restores focus on destroy", async () => {
    const { host, outside } = scaffold();
    outside.focus();
    trap(host);
    teardown?.();
    teardown = undefined;
    await waitFor(() => expect(document.activeElement).toBe(outside));
  });
});
