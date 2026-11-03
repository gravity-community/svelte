<script lang="ts">
import { onMount, type Snippet, untrack } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { prefersReducedMotion } from "svelte/motion";
import { animate, motionValue } from "motion";
import { DragGesture, type FullGestureState } from "@use-gesture/vanilla";
import { focusTrap } from "../../attachments/focus-trap/focus-trap.svelte.ts";
import { preventWheel } from "../../attachments/prevent-wheel/prevent-wheel.ts";
import { clamp, UI_SPRING } from "../../motion/spring.ts";
import { cn } from "../../utils/classes.ts";
import { resolveSnap, RUBBERBAND, SLOP, VELOCITY_MAX } from "./snap.ts";

// The sheet owns these attributes; `onclose` is its own callback, not the DOM event.
type Props =
  & Omit<
    HTMLAttributes<HTMLElement>,
    | "children"
    | "style"
    | "role"
    | "tabindex"
    | "aria-modal"
    | "aria-label"
    | "onclose"
    | "onpointerdown"
  >
  & {
    /** Expanded, or resting at peek. */
    expanded?: boolean;
    /** Visible height at peek, px. */
    peekHeight?: number;
    /** Sheet height, px, clamped to the viewport. Expanding only translates it. */
    expandedHeight?: number;
    /** Fixed bottom chrome (px, e.g. a tab bar) kept clear and interactive; the sheet is then non-modal. */
    bottomInset?: number;
    /** Accessible name of the sheet and its grabber. */
    label: string;
    /** User-initiated collapse only (drag, grabber, scrim, Escape), never a parent-set `expanded`. */
    onclose?: () => void;
    scrim?: boolean;
    /** Parent-owned scrim whose opacity the sheet drives instead of rendering its own. */
    scrimEl?: HTMLElement | null;
    /** Expansion progress, 0 at peek to 1 expanded, written every frame. */
    progress?: number;
    children: Snippet;
  };

let {
  expanded = $bindable(false),
  peekHeight = 132,
  expandedHeight = 460,
  bottomInset = 0,
  label,
  onclose,
  scrim = true,
  scrimEl = null,
  progress = $bindable(expanded ? 1 : 0),
  class: className,
  children,
  ...rest
}: Props = $props();

let sheetEl = $state<HTMLElement>();
let scrollerEl = $state<HTMLDivElement>();
let ownScrimEl = $state<HTMLDivElement>();
let dragging = $state(false);

// Reserved chrome (the z-40 tab bar) must stay above even a rubberband overshoot.
const plane = $derived(bottomInset > 0 ? "z-30" : "z-[45]");

// Downward translation in px: 0 = expanded, peekOffset = peek.
const offset = motionValue(0);
let running: { stop: () => void } | null = null;
let animatingTo: number | null = null;
// svelte-ignore state_referenced_locally (a guess until the geometry effect measures)
let peekOffset = expandedHeight - peekHeight;
let fromExpanded = false;
let inScroller = false;

// Shared by the pre-hydration style and the geometry effect so they can't drift.
const geometryCss = () =>
  `height: ${expandedHeight}px; bottom: ${bottomInset}px; ` +
  `max-height: calc(100dvh - 7rem - ${bottomInset}px);`;

// Static on purpose: after mount the spring owns the inline transform. The
// translate resolves against the rendered height, so a clamped sheet paints right.
// svelte-ignore state_referenced_locally
const sheetStyle = `${geometryCss()} transform: translate3d(0, ${
  expanded ? "0px" : `calc(100% - ${peekHeight}px)`
}, 0);`;
// svelte-ignore state_referenced_locally
const scrimStyle = `opacity: ${expanded ? 1 : 0}; bottom: ${bottomInset}px;`;

const target = () => (expanded ? 0 : peekOffset);

// Transform, progress and scrim are written together, so they never disagree within a frame.
function writeFrame(): void {
  if (!sheetEl) return;
  const y = offset.get();
  sheetEl.style.transform = `translate3d(0, ${y}px, 0)`;
  progress = peekOffset > 0 ? clamp(1 - y / peekOffset, 0, 1) : 1;
  const dimEl = scrimEl ?? ownScrimEl;
  if (dimEl) dimEl.style.opacity = String(progress);
}

function freeze(): void {
  running?.stop();
  running = null;
  animatingTo = null;
}

function settle(): void {
  freeze();
  offset.jump(target());
  // `jump` skips unchanged values, but a cssText reset still needs the transform back.
  writeFrame();
}

function snapOrAnimate(seedV = 0): void {
  if (prefersReducedMotion.current) {
    settle();
    return;
  }
  const to = target();
  // Keep the velocity a release already seeded toward the same rest position.
  if (seedV === 0 && running && animatingTo === to) return;
  animatingTo = to;
  running = animate(
    offset,
    to,
    seedV !== 0 ? { ...UI_SPRING, velocity: seedV } : { ...UI_SPRING },
  );
}

function measure(): void {
  if (!sheetEl) return;
  peekOffset = Math.max(0, sheetEl.offsetHeight - peekHeight);
}

function requestCollapse(): void {
  if (!expanded) return;
  expanded = false;
  onclose?.();
}

function toggle(): void {
  if (expanded) requestCollapse();
  else expanded = true;
}

function onResize(): void {
  measure();
  if (!dragging) settle();
}

// A nested bits-ui layer (popover, drawer) prevents default on the Escape it closes.
function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && !event.defaultPrevented) requestCollapse();
}

// Gesture: use-gesture owns slop, capture, kinematics and rubberband; this
// decides whether a drag belongs to the sheet or to the scroller.

const preventTouch = (e: TouchEvent) => e.preventDefault();

function releaseTouchLock(): void {
  globalThis.removeEventListener("touchmove", preventTouch);
}

function resumeFrozenSnap(): void {
  if (offset.get() !== target()) snapOrAnimate();
}

// Expanded, a drag that starts in the scroller is the scroller's unless it pulls down from the top.
const claims = (dy: number): boolean =>
  !fromExpanded || !inScroller ||
  (dy > 0 && (scrollerEl?.scrollTop ?? 0) <= 0);

// Read at pointerdown: by the first drag callback the pointer may have left the
// scroller. Freezing here lets a finger catch the sheet mid-flight.
function onPointerDown(e: PointerEvent): void {
  if (!e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
  fromExpanded = expanded;
  inScroller = scrollerEl?.contains(e.target as Node) ?? false;
  freeze();
}

// A press that never crosses the drag threshold gets no gesture callback.
function onPointerUp(): void {
  if (!dragging) resumeFrozenSnap();
}

function onDrag(state: FullGestureState<"drag">): void {
  const { first, last, offset: [, oy], velocity: [, vy], direction } = state;
  if (first) {
    if (!claims(direction[1])) {
      // Native scroll owns the rest of the gesture.
      state.cancel();
      resumeFrozenSnap();
      return;
    }
    dragging = true;
    // Only a claimed sheet drag may suppress native scroll.
    globalThis.addEventListener("touchmove", preventTouch, { passive: false });
  }
  // A cancelled gesture re-emits once.
  if (!dragging) return;
  offset.jump(oy);
  if (!last) return;

  dragging = false;
  releaseTouchLock();
  // use-gesture gives |velocity| in px/ms with the sign in `direction`; snap wants signed px/s.
  const signed = clamp(vy * direction[1] * 1000, -VELOCITY_MAX, VELOCITY_MAX);
  const wantExpanded =
    resolveSnap(offset.get(), peekOffset, signed) === "expanded";
  const collapsedByUser = fromExpanded && !wantExpanded;
  expanded = wantExpanded;
  snapOrAnimate(signed);
  if (collapsedByUser) onclose?.();
}

$effect(() => {
  if (!sheetEl) return;
  const gesture = new DragGesture(sheetEl, onDrag, {
    axis: "y",
    // Below it the press is a tap, so the grabber still works.
    threshold: SLOP,
    // Also swallows the ghost click that ends a drag on the grabber.
    filterTaps: true,
    pointer: { keys: false },
    from: () => [0, offset.get()],
    bounds: () => ({ top: 0, bottom: peekOffset }),
    rubberband: RUBBERBAND,
  });
  return () => {
    gesture.destroy();
    releaseTouchLock();
  };
});

// Geometry changes (and mount) re-measure and snap without a tween.
$effect(() => {
  void geometryCss();
  void peekHeight;
  void scrimEl;
  if (!sheetEl) return;
  untrack(() => {
    sheetEl!.style.cssText = geometryCss();
    measure();
    settle();
  });
});

// `expanded` flips animate; after a release, the same-target guard keeps its seeded velocity.
$effect(() => {
  void expanded;
  untrack(() => {
    if (dragging) return;
    snapOrAnimate();
  });
});

const releaseFrames = offset.on("change", writeFrame);

onMount(() => () => {
  freeze();
  releaseFrames();
});
</script>

<svelte:window
  onkeydown={onKeydown}
  onresize={onResize}
  onpointerup={onPointerUp}
  onpointercancel={onPointerUp}
/>

{#if scrim && !scrimEl}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div
  bind:this={ownScrimEl}
  class={[
      "fixed inset-x-0 top-0 touch-none bg-scrim",
      plane,
      !expanded && "pointer-events-none",
    ]}
  style={scrimStyle}
  aria-hidden="true"
  onclick={requestCollapse}
  {@attach preventWheel}
></div>
{/if}

<section
  {...rest}
  bind:this={sheetEl}
  role={expanded ? "dialog" : undefined}
  aria-modal={expanded && bottomInset === 0 ? "true" : undefined}
  aria-label={label}
  tabindex="-1"
  class={cn(
    "fixed inset-x-0 flex flex-col rounded-t-[22px] border-t border-border-subtle bg-surface-raised outline-none",
    plane,
    !expanded && "touch-none",
    dragging && "select-none",
    className,
  )}
  style={sheetStyle}
  onpointerdown={onPointerDown}
  {@attach focusTrap(() => ({
    enabled: expanded && bottomInset === 0,
    initialFocus: "container",
  }))}
>
  <button
    type="button"
    class="flex h-7 w-full shrink-0 touch-none items-center justify-center rounded-t-[22px] focus-visible:-outline-offset-2"
    aria-expanded={expanded}
    aria-label={label}
    onclick={toggle}
  >
    <span
      class="h-1 w-[38px] rounded-full bg-border-interactive forced-colors:bg-[CanvasText]"
    ></span>
  </button>
  <div
    bind:this={scrollerEl}
    class={[
      "min-h-0 flex-1 touch-pan-y overscroll-contain",
      expanded ? "overflow-y-auto" : "overflow-hidden",
    ]}
  >
    {@render children()}
  </div>
</section>
