import { flushSync } from "svelte";
import { prefersReducedMotion } from "svelte/motion";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { indicator, type IndicatorKey } from "./indicator.svelte.ts";

const GEOM: Record<string, { offsetLeft: number; offsetWidth: number }> = {
  ui: { offsetLeft: 0, offsetWidth: 40 },
  cli: { offsetLeft: 46, offsetWidth: 62 },
};

// motion pools one ResizeObserver for the process, so a reveal is driven
// through a stand-in for it.
let notify: ((entries: unknown[]) => void) | null = null;
vi.stubGlobal(
  "ResizeObserver",
  class {
    constructor(callback: (entries: unknown[]) => void) {
      notify = callback;
    }
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  },
);
const reveal = (host: HTMLElement) =>
  notify?.([{ target: host, borderBoxSize: undefined }]);

// jsdom lays nothing out: give the children a geometry, keyed off `data-key`.
function layOut(): () => void {
  const spies = [
    ...(["offsetLeft", "offsetWidth"] as const).map((prop) =>
      vi.spyOn(HTMLElement.prototype, prop, "get").mockImplementation(
        function (this: HTMLElement) {
          return GEOM[this.dataset.key ?? ""]?.[prop] ?? 0;
        },
      )
    ),
    vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockReturnValue(4),
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(28),
  ];
  return () => spies.forEach((spy) => spy.mockRestore());
}

function host(): HTMLElement {
  const el = document.createElement("div");
  el.innerHTML = `<div data-indicator></div>` +
    `<button data-key="ui">UI</button><button data-key="cli">CLI</button>`;
  document.body.append(el);
  return el;
}

const barOf = (el: HTMLElement) =>
  el.querySelector<HTMLElement>("[data-indicator]")!;

const xOf = (bar: HTMLElement) =>
  Number(/translate3d\((-?[\d.]+)px/.exec(bar.style.transform)?.[1]);

let teardown: (() => void) | undefined;

// Runs the attachment the way {@attach} does, inside an effect; returns a key setter.
function track(el: HTMLElement, initial: IndicatorKey) {
  let key = $state(initial);
  teardown = $effect.root(() => {
    $effect(() => indicator(() => key)(el));
  });
  flushSync();
  return (next: IndicatorKey) => {
    key = next;
    flushSync();
  };
}

const destroy = () => {
  teardown?.();
  teardown = undefined;
};

afterEach(() => {
  destroy();
  document.body.replaceChildren();
});

describe("indicator", () => {
  it("leaves the host unplaced while there is no box to measure", () => {
    const el = host();
    track(el, "ui");
    expect(el).not.toHaveAttribute("data-placed");
  });

  it("does nothing without an overlay to move", () => {
    const el = document.createElement("div");
    el.innerHTML = `<button data-key="ui">UI</button>`;
    document.body.append(el);
    expect(() => track(el, "ui")).not.toThrow();
    expect(el).not.toHaveAttribute("data-placed");
  });

  it("arrives already in place when a hidden host is revealed", () => {
    const el = host();
    track(el, "cli");
    expect(el).not.toHaveAttribute("data-placed");

    const restore = layOut();
    reveal(el);
    expect(el).toHaveAttribute("data-placed");
    expect(xOf(barOf(el))).toBe(46);
    restore();
  });

  describe("once the children have a box", () => {
    // The returned restore is vitest's per-test teardown.
    beforeEach(layOut);

    it("mounts settled on the named child", () => {
      const el = host();
      track(el, "ui");
      const bar = barOf(el);
      expect(el).toHaveAttribute("data-placed");
      expect(bar.style.transform).toBe("translate3d(0px, 0, 0)");
      expect(bar.style.width).toBe("40px");
      expect(bar.style.top).toBe("4px");
      expect(bar.style.height).toBe("28px");
    });

    it("springs to the next child rather than jumping", async () => {
      const el = host();
      const bar = barOf(el);
      track(el, "ui")("cli");
      // A spring's first sample lands on the next frame; a snap would be there already.
      expect(xOf(bar)).toBe(0);
      await vi.waitFor(() => {
        expect(xOf(bar)).toBe(46);
        expect(bar.style.width).toBe("62px");
      }, { timeout: 2000 });
    });

    it("snaps when the reader asks for reduced motion", () => {
      const reduced = vi.spyOn(prefersReducedMotion, "current", "get")
        .mockReturnValue(true);
      const el = host();
      track(el, "ui")("cli");
      expect(xOf(barOf(el))).toBe(46);
      reduced.mockRestore();
    });

    it("unplaces rather than shrinks when nothing matches, and returns in place", () => {
      const el = host();
      const select = track(el, "cli");
      expect(xOf(barOf(el))).toBe(46);

      select(undefined);
      expect(el).not.toHaveAttribute("data-placed");

      // Back from nowhere snaps rather than sliding in from the left edge.
      select("cli");
      expect(el).toHaveAttribute("data-placed");
      expect(xOf(barOf(el))).toBe(46);
    });

    it("does not re-place a stale child after being unplaced", () => {
      const el = host();
      track(el, "cli")(undefined);
      reveal(el);
      expect(el).not.toHaveAttribute("data-placed");
    });

    it("stops observing and animating on destroy", async () => {
      const el = host();
      track(el, "ui")("cli");
      destroy();
      const x = xOf(barOf(el));
      reveal(el);
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(xOf(barOf(el))).toBe(x);
    });
  });
});
