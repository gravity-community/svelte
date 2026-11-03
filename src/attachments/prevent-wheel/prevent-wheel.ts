import type { Attachment } from "svelte/attachments";
import { on } from "svelte/events";

/** Blocks wheel scrolling over the node, e.g. a scrim above a scrollable page. */
export const preventWheel: Attachment<HTMLElement> = (node) =>
  on(node, "wheel", (event) => event.preventDefault(), { passive: false });
