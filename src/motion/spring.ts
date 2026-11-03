export type SpringState = {
  x: number;
  /** units/s */
  v: number;
};

/**
 * The interruptible single-value UI spring (expand's width, BottomSheet's
 * translate) for motion's `animate`. Near-critical (ζ ≈ 0.84), so slow,
 * keyboard and breakpoint moves don't overshoot; a fast flick bounces by
 * seeding `velocity`. The rest thresholds end it once it rounds to a stable px.
 */
export const UI_SPRING = {
  type: "spring",
  stiffness: 360,
  damping: 32,
  restDelta: 0.5,
  restSpeed: 5,
} as const;

// A fixed-step integrator for engines that drive many springs from one shared
// rAF loop, which motion's per-value animations can't pool.

/** Fixed substep, s: whole substeps keep trajectories frame-rate invariant and deterministic. */
export const SPRING_SUBSTEP = 1 / 120;

/** Longest frame delta integrated, s, so a restored background tab doesn't burst. */
export const MAX_FRAME_DELTA = 0.1;

export function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}

/** One semi-implicit Euler substep, mass 1. Mutates `s`. */
export function stepSpring(
  s: SpringState,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
): void {
  s.v += (stiffness * (target - s.x) - damping * s.v) * dt;
  s.x += s.v * dt;
}

export function isSettled(
  s: SpringState,
  target: number,
  epsX: number,
  epsV: number,
): boolean {
  return Math.abs(s.x - target) <= epsX && Math.abs(s.v) <= epsV;
}

/** Steps `substeps` times toward `target`; snaps and returns true once settled. */
export function advance(
  s: SpringState,
  target: number,
  stiffness: number,
  damping: number,
  substeps: number,
  epsX: number,
  epsV: number,
): boolean {
  for (let i = 0; i < substeps; i++) {
    stepSpring(s, target, stiffness, damping, SPRING_SUBSTEP);
  }
  if (!isSettled(s, target, epsX, epsV)) return false;
  s.x = target;
  s.v = 0;
  return true;
}

/** Consumes elapsed seconds in whole substeps, carrying the remainder in `clock.acc`. */
export function substepCount(
  clock: { acc: number },
  elapsedSeconds: number,
): number {
  clock.acc += clamp(elapsedSeconds, 0, MAX_FRAME_DELTA);
  const n = Math.floor(clock.acc / SPRING_SUBSTEP);
  clock.acc -= n * SPRING_SUBSTEP;
  return n;
}
