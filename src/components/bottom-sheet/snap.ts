// BottomSheet snap policy. `offset` is the downward translation in px:
// 0 = expanded, `peekOffset` = resting at peek.

/** Release speed (px/s, positive = down) above which a flick commits in its direction. */
export const FLICK_VELOCITY = 400;

/** Overdrag elasticity past either rest stop, handed to use-gesture's rubberband. */
export const RUBBERBAND = 0.25;

/** Vertical travel (px) before a gesture claims sheet or scroll. */
export const SLOP = 6;

/** Release velocity cap (px/s) against degenerate synthetic gestures. */
export const VELOCITY_MAX = 2500;

/** A fast flick commits in its direction; otherwise the nearer rest position wins. */
export function resolveSnap(
  offset: number,
  peekOffset: number,
  vy: number,
): "peek" | "expanded" {
  if (vy >= FLICK_VELOCITY) return "peek";
  if (vy <= -FLICK_VELOCITY) return "expanded";
  return offset > peekOffset / 2 ? "peek" : "expanded";
}
