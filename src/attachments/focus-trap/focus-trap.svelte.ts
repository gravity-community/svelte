import type { Attachment } from "svelte/attachments";
import { createFocusTrap } from "focus-trap";

export type FocusTrapParams = {
  /** Default true. Engaging saves the current focus, disengaging restores it. */
  enabled?: boolean;
  /** "container" focuses the node itself (give it tabindex="-1"). */
  initialFocus?: "first" | "container";
};

// bits-ui layers trap focus with their own FocusScope; two traps would pull focus back and forth.
const LAYER = "[data-dialog-content], [data-popover-content]";

/** Keeps Tab cycling inside the node, pausing while a bits-ui layer holds focus. Escape and outside clicks stay with the host. */
export function focusTrap(
  params: () => FocusTrapParams | undefined = () => undefined,
): Attachment<HTMLElement> {
  return (node) => {
    let initialFocus: FocusTrapParams["initialFocus"];
    let resuming = false;

    const trap = createFocusTrap(node, {
      // On resume, keep the element focus came back to.
      initialFocus: () =>
        !resuming && initialFocus === "container" ? node : undefined,
      fallbackFocus: node,
      escapeDeactivates: false,
      allowOutsideClick: true,
      delayInitialFocus: false,
      preventScroll: true,
    });

    // Added before the trap's own capture listener, so pausing here skips it for this event.
    const yieldToLayers = (event: FocusEvent) => {
      const target = event.target as Element;
      if (node.contains(target)) {
        if (!trap.paused) return;
        resuming = true;
        trap.unpause();
        resuming = false;
      } else if (trap.active && !trap.paused && target.closest?.(LAYER)) {
        trap.pause();
      }
    };
    document.addEventListener("focusin", yieldToLayers, true);

    $effect(() => {
      const next = params();
      initialFocus = next?.initialFocus;
      if (next?.enabled ?? true) trap.activate();
      else trap.deactivate();
    });

    return () => {
      document.removeEventListener("focusin", yieldToLayers, true);
      trap.deactivate();
    };
  };
}
