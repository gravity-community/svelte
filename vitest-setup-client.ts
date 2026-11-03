import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom gaps that Svelte, bits-ui and the gesture code rely on.

Object.defineProperty(window, "matchMedia", {
  writable: true,
  enumerable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// jsdom computes no font-size; rem lengths (expand's widths) need the root's.
document.documentElement.style.fontSize = "16px";

// tabbable treats zero-size nodes as hidden, which would empty every focus trap.
Object.defineProperty(HTMLElement.prototype, "getClientRects", {
  configurable: true,
  value: () => [{ width: 8, height: 8 }],
});

if (typeof globalThis.PointerEvent !== "function") {
  class PointerEventShim extends MouseEvent {
    pointerId: number;
    pointerType: string;
    isPrimary: boolean;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? "mouse";
      this.isPrimary = init.isPrimary ?? true;
    }
  }
  globalThis.PointerEvent = PointerEventShim as unknown as typeof PointerEvent;
}

// Gesture libraries feature-detect pointer support once, at import.
if (!("onpointerdown" in window)) {
  Object.defineProperty(window, "onpointerdown", {
    configurable: true,
    value: null,
  });
}

for (const name of ["setPointerCapture", "releasePointerCapture"]) {
  if (!(name in Element.prototype)) {
    Object.defineProperty(Element.prototype, name, {
      configurable: true,
      value: () => {},
    });
  }
}
if (!("hasPointerCapture" in Element.prototype)) {
  Object.defineProperty(Element.prototype, "hasPointerCapture", {
    configurable: true,
    value: () => false,
  });
}

if (!("scrollIntoView" in Element.prototype)) {
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: () => {},
  });
}

if (typeof globalThis.ResizeObserver !== "function") {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

// bits-ui PinInput: CSS.supports on mount, elementFromPoint while focused.
if (typeof CSS.supports !== "function") {
  Object.defineProperty(CSS, "supports", {
    configurable: true,
    value: () => false,
  });
}
if (typeof document.elementFromPoint !== "function") {
  Object.defineProperty(Document.prototype, "elementFromPoint", {
    configurable: true,
    value: () => null,
  });
}

// Svelte transitions run on the Web Animations API.
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = function () {
    const animation = { onfinish: null as (() => void) | null, cancel() {} };
    setTimeout(() => animation.onfinish?.());
    return animation as unknown as Animation;
  };
}
