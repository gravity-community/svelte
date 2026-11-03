// Global pointer velocity, EMA-smoothed, from one passive window pointermove
// listener that only runs while something subscribes. Ambient cursor speed for
// springs like `expand`; a per-gesture velocity belongs to the gesture library.

export type VelocityState = {
  vx: number;
  vy: number;
  lastX: number;
  lastY: number;
  /** ms of the last sample, -1 before the first */
  lastT: number;
};

/** EMA weight of the newest sample. */
const SMOOTHING = 0.4;
/** ms without a move after which the pointer counts as at rest, so a paused cursor injects no momentum. */
const STALE_MS = 60;

let subscribers = 0;
const state = createVelocityState();

export function createVelocityState(): VelocityState {
  return { vx: 0, vy: 0, lastX: 0, lastY: 0, lastT: -1 };
}

/** Folds one sample into `s`. The first sample only primes the position. */
export function stepPointerVelocity(
  s: VelocityState,
  x: number,
  y: number,
  tMs: number,
): void {
  if (s.lastT >= 0) {
    const dt = (tMs - s.lastT) / 1000;
    if (dt > 0) {
      const ix = (x - s.lastX) / dt;
      const iy = (y - s.lastY) / dt;
      s.vx = s.vx * (1 - SMOOTHING) + ix * SMOOTHING;
      s.vy = s.vy * (1 - SMOOTHING) + iy * SMOOTHING;
    }
  }
  s.lastX = x;
  s.lastY = y;
  s.lastT = tMs;
}

export function subscribePointerVelocity(): () => void {
  if (typeof globalThis.addEventListener !== "function") return () => {};
  if (subscribers === 0) {
    globalThis.addEventListener("pointermove", onMove, { passive: true });
  }
  subscribers++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    subscribers--;
    if (subscribers === 0) {
      globalThis.removeEventListener("pointermove", onMove);
      reset();
    }
  };
}

/** Latest smoothed velocity, px/s; zero while untracked or stale. */
export function pointerVelocity(): { x: number; y: number } {
  if (state.lastT < 0 || performance.now() - state.lastT > STALE_MS) {
    return { x: 0, y: 0 };
  }
  return { x: state.vx, y: state.vy };
}

function onMove(e: PointerEvent): void {
  // Touch has no hover, and a tap must not inject momentum.
  if (e.pointerType === "touch") {
    reset();
    return;
  }
  stepPointerVelocity(state, e.clientX, e.clientY, e.timeStamp);
}

function reset(): void {
  state.vx = 0;
  state.vy = 0;
  state.lastT = -1;
}
