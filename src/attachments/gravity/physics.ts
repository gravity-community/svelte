// Screen space: +x right, +y down. (px, py) is the pointer's offset from the
// element's centre and (hx, hy) its half extents, all in px.
// Sign convention: pointer below centre ⇒ rotateX(+), right of centre ⇒
// rotateY(−), so the near edge rises toward the viewer (attracted, not pressed).

import { clamp } from "../../motion/spring.ts";
import type { ForceShape } from "./types.ts";

export type FieldTargets = {
  /** rotateX, deg */
  rx: number;
  /** rotateY, deg */
  ry: number;
  /** translateZ, px */
  lift: number;
};

/**
 * Pointer offset → tilt and lift targets. Tilt fades to zero at the centre,
 * where the pull direction is undefined, so crossing it never pops; lift peaks
 * there instead.
 */
export function fieldTargets(
  px: number,
  py: number,
  hx: number,
  hy: number,
  reach: number,
  maxTilt: number,
  maxLift: number,
  shape: ForceShape = smoothstep,
): FieldTargets {
  if (reach <= 0 || hx <= 0 || hy <= 0) return { rx: 0, ry: 0, lift: 0 };

  const outX = Math.abs(px) - hx;
  const outY = Math.abs(py) - hy;
  const dOut = Math.hypot(Math.max(outX, 0), Math.max(outY, 0));
  if (dOut >= reach) return { rx: 0, ry: 0, lift: 0 };

  const approach = clamp(shape(1 - dOut / reach), 0, 1);
  const rho = Math.hypot(px / hx, py / hy); // 1 on the inscribed ellipse
  const centering = smoothstep(1 - rho);

  const gTilt = approach * (1 - centering);
  const gLift = approach * (0.3 + 0.7 * centering);

  // Field-normalised direction, so a diagonal approach splits the tilt across both axes.
  const mx = px / (hx + reach);
  const my = py / (hy + reach);
  const len = Math.hypot(mx, my);
  const dirX = len < 1e-4 ? 0 : mx / len;
  const dirY = len < 1e-4 ? 0 : my / len;

  // Equal edge lift: a wide element yaws less, so its sides rise about as far as its top and bottom.
  const maxYaw = clamp(maxTilt * (hy / hx), Math.min(1, maxTilt), maxTilt);

  return {
    rx: maxTilt * gTilt * dirY,
    ry: -maxYaw * gTilt * dirX,
    lift: maxLift * gLift,
  };
}

/** Hermite smoothstep on [0, 1]. Its exact zero at the field edge is the engine's sleep predicate. */
export function smoothstep(x: number): number {
  const t = clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
}
