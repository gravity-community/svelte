import type { Attachment } from "svelte/attachments";
import { untrack } from "svelte";
import { animate, frame } from "motion";
import { clamp, UI_SPRING } from "../../motion/spring.ts";
import {
  pointerVelocity,
  subscribePointerVelocity,
} from "../../motion/pointer-velocity.ts";

/** rem follows the root font size, as the CSS beside it does. */
type Length = `${number}px` | `${number}rem`;

export type ExpandParams = {
  collapsed?: Length;
  expanded?: Length;
  /** Viewport width from which it stays expanded. Read once at mount. */
  wideAt?: Length;
  /** Viewport width below which CSS owns the width: the CSS breakpoint, e.g. `64rem` for `lg`. Read once at mount. */
  disableBelow?: Length;
  /** Pin expanded, ignoring hover and focus. */
  open?: boolean;
};

const DEFAULTS: Required<ExpandParams> = {
  collapsed: "4rem",
  expanded: "16rem",
  wideAt: "1600px",
  disableBelow: "64rem",
  open: false,
};

// Cursor px/s → seeded width velocity px/s; the cap keeps a hard flick to ~5% overshoot.
const MOMENTUM_GAIN = 1.8;
const MOMENTUM_MAX = 6000;

/**
 * Springs the element's inline `width` between collapsed and expanded while it
 * is hovered or holds focus. A fast pointer flick seeds the spring's velocity.
 * The element's CSS width is the SSR fallback.
 *
 * @example <nav {@attach expand(() => ({ open }))}>…</nav>
 */
export function expand(
  params: () => ExpandParams | undefined = () => undefined,
): Attachment<HTMLElement> {
  return (node) => {
    // jsdom has no matchMedia.
    if (typeof matchMedia !== "function") return;

    let cfg = untrack(() => ({ ...DEFAULTS, ...params() }));
    const wide = matchMedia(`(min-width: ${cfg.wideAt})`);
    const active = matchMedia(`(min-width: ${cfg.disableBelow})`);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const releaseVelocity = subscribePointerVelocity();

    let mounted = false;
    let hovered = false;
    let focused = false;
    let target = 0;
    let running: { stop: () => void } | null = null;

    const want = () =>
      toPx(
        cfg.open || wide.matches || hovered || focused
          ? cfg.expanded
          : cfg.collapsed,
      );

    const seedToward = (direction: 1 | -1) =>
      direction *
      clamp(Math.abs(pointerVelocity().x) * MOMENTUM_GAIN, 0, MOMENTUM_MAX);

    function halt(): void {
      running?.stop();
      running = null;
    }

    // A stopped spring still writes one last frame, so the width is cleared
    // again after motion's render step.
    function release(): void {
      node.style.removeProperty("width");
      frame.postRender(() => {
        if (!running) node.style.removeProperty("width");
      });
    }

    function retarget(velocity = 0): void {
      if (!active.matches) {
        halt();
        release();
        return;
      }
      const previous = target;
      target = want();
      // The first placement settles without animating.
      if (!mounted || reduce.matches) {
        halt();
        node.style.width = `${target}px`;
        return;
      }
      // Only a real open/close flip takes the pointer's momentum.
      running = animate(
        node,
        { width: target },
        velocity !== 0 && target !== previous
          ? { ...UI_SPRING, velocity }
          : { ...UI_SPRING },
      );
    }

    const onQueryChange = () => retarget();
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      hovered = true;
      retarget(seedToward(1));
    };
    const onLeave = () => {
      hovered = false;
      retarget(seedToward(-1));
    };
    const onFocusIn = () => {
      focused = true;
      retarget();
    };
    const onFocusOut = (event: FocusEvent) => {
      if (node.contains(event.relatedTarget as Node | null)) return;
      focused = false;
      retarget();
    };

    const queries = [wide, active, reduce];
    for (const query of queries) {
      query.addEventListener("change", onQueryChange);
    }
    node.addEventListener("pointerenter", onEnter);
    node.addEventListener("pointerleave", onLeave);
    node.addEventListener("focusin", onFocusIn);
    node.addEventListener("focusout", onFocusOut);

    $effect(() => {
      cfg = { ...DEFAULTS, ...params() };
      retarget();
      mounted = true;
    });

    return () => {
      for (const query of queries) {
        query.removeEventListener("change", onQueryChange);
      }
      node.removeEventListener("pointerenter", onEnter);
      node.removeEventListener("pointerleave", onLeave);
      node.removeEventListener("focusin", onFocusIn);
      node.removeEventListener("focusout", onFocusOut);
      releaseVelocity();
      halt();
      release();
    };
  };
}

function toPx(length: Length): number {
  const value = parseFloat(length);
  if (!length.endsWith("rem")) return value;
  return value *
    parseFloat(getComputedStyle(document.documentElement).fontSize);
}
