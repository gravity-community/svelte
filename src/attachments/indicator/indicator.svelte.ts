import type { Attachment } from "svelte/attachments";
import { animate, cancelFrame, frame, motionValue, resize } from "motion";
import { prefersReducedMotion } from "svelte/motion";
import { type Edges, edgeSprings, movesForward, travels } from "./travel.ts";

/** Matched against a child's `data-key`. */
export type IndicatorKey = string | undefined;

/**
 * Springs an overlay across a row of children to the one `key` names.
 *
 * Host contract: the host is `relative group`; the overlay is a
 * `[data-indicator]` child at `left-0`; trackable children are direct children
 * with `data-key`. The host gets `data-placed` while the overlay holds a
 * measurement, so without it (no JS, `display:none`) children style themselves.
 *
 * @example
 * <div class="group relative" {@attach indicator(() => active)}>
 *   <div data-indicator class="absolute left-0 hidden group-data-[placed]:block"></div>
 *   {#each items as item}<button data-key={item.id}>{item.label}</button>{/each}
 * </div>
 */
export function indicator(key: () => IndicatorKey): Attachment<HTMLElement> {
  return (node) => {
    const bar = node.querySelector<HTMLElement>("[data-indicator]");
    const start = motionValue(0);
    const end = motionValue(0);
    const running: { stop: () => void }[] = [];
    let placed = false;
    let held: IndicatorKey;

    // Physical left/translateX: offsetLeft is physical too, so this holds under RTL.
    function paint(): void {
      if (!bar) return;
      const x = start.get();
      bar.style.transform = `translate3d(${x}px, 0, 0)`;
      bar.style.width = `${end.get() - x}px`;
    }

    // frame.render dedupes by callback, so both edges repaint once per frame.
    const schedule = () => frame.render(paint);
    const release = [start.on("change", schedule), end.on("change", schedule)];

    function halt(): void {
      for (const animation of running) animation.stop();
      running.length = 0;
    }

    function move(to: Edges, travel: boolean): void {
      halt();
      if (!travel) {
        start.jump(to.start);
        end.jump(to.end);
        // `jump` is silent when the value is unchanged; a height-only re-measure still needs a paint.
        paint();
        return;
      }
      const springs = edgeSprings(
        movesForward({ start: start.get(), end: end.get() }, to),
      );
      running.push(
        animate(start, to.start, springs.start),
        animate(end, to.end, springs.end),
      );
    }

    function place(next: IndicatorKey): void {
      const target = next === undefined
        ? null
        : node.querySelector<HTMLElement>(
          `:scope > [data-key="${CSS.escape(next)}"]`,
        );
      const from = held;
      const was = placed;
      held = next;
      // Zero width means no box yet: display:none, pre-layout, or no layout at all.
      placed = Boolean(bar && target && target.offsetWidth > 0);
      node.toggleAttribute("data-placed", placed);
      if (!placed || !bar || !target) {
        halt();
        return;
      }
      bar.style.top = `${target.offsetTop}px`;
      bar.style.height = `${target.offsetHeight}px`;
      const x = target.offsetLeft;
      move(
        { start: x, end: x + target.offsetWidth },
        travels(was, from, next, prefersReducedMotion.current),
      );
    }

    $effect(() => place(key()));

    // Also reports a host gaining its first box, e.g. revealed from display:none.
    const unobserve = resize(node, () => place(held));

    // A late web font re-lays out the children without resizing the host.
    if (document.fonts && document.fonts.status !== "loaded") {
      void document.fonts.ready.then(() => node.isConnected && place(held));
    }

    return () => {
      unobserve();
      cancelFrame(paint);
      halt();
      for (const off of release) off();
    };
  };
}
