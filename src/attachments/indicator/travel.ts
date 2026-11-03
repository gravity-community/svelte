import { UI_SPRING } from "../../motion/spring.ts";

/** A box's horizontal edges in its offsetParent's padding box, px. */
export type Edges = {
  start: number;
  end: number;
};

const LEAD = 1.25;

// UI_SPRING arriving sooner. Damping scales with √stiffness, which keeps the
// damping ratio, so the leading edge never overshoots.
const LEAD_SPRING = {
  ...UI_SPRING,
  stiffness: UI_SPRING.stiffness * LEAD,
  damping: UI_SPRING.damping * Math.sqrt(LEAD),
};

/** Direction by box centre, not edge, so a move to a much wider neighbour still reads true. */
export function movesForward(from: Edges, to: Edges): boolean {
  return to.start + to.end > from.start + from.end;
}

/** The edge moved toward leads and the other trails: the overlay stretches into the move and lands flush. */
export function edgeSprings(forward: boolean) {
  return forward
    ? { start: UI_SPRING, end: LEAD_SPRING }
    : { start: LEAD_SPRING, end: UI_SPRING };
}

/** Only a change between two live targets travels; a first placement, reveal or re-measure snaps. */
export function travels(
  placed: boolean,
  held: string | undefined,
  next: string | undefined,
  reduced: boolean,
): boolean {
  return placed && !reduced && held !== next;
}
