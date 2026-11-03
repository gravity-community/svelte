import { assert, assertAlmostEquals, assertEquals } from "@std/assert";
import { fieldTargets } from "./physics.ts";
import { clamp } from "../../motion/spring.ts";
import { GRAVITY_DEFAULTS } from "./types.ts";

// A md text button, 140×48 px.
const HX = 70;
const HY = 24;
const REACH = 48;
const TILT = GRAVITY_DEFAULTS.maxTilt;
const LIFT = GRAVITY_DEFAULTS.lift;

const at = (px: number, py: number) =>
  fieldTargets(px, py, HX, HY, REACH, TILT, LIFT);

Deno.test("center: zero tilt by symmetry, lift at its maximum", () => {
  const t = at(0, 0);
  assertEquals(t.rx, 0);
  assertEquals(t.ry, 0);
  assertAlmostEquals(t.lift, LIFT, 1e-9);
});

Deno.test("field edge and beyond: exactly zero (the sleep predicate)", () => {
  for (
    const [px, py] of [
      [HX + REACH, 0],
      [HX + REACH + 100, 0],
      [0, HY + REACH],
      [HX + REACH, HY + REACH],
    ]
  ) {
    const t = at(px, py);
    assertEquals(t.rx, 0);
    assertEquals(t.ry, 0);
    assertEquals(t.lift, 0);
  }
});

Deno.test("attraction sign convention: near edge rises toward the pointer", () => {
  assert(at(0, HY + 10).rx > 0, "below ⇒ rx > 0");
  assert(at(0, -(HY + 10)).rx < 0, "above ⇒ rx < 0");
  assertEquals(at(0, HY + 10).ry, 0);
  assert(at(HX + 10, 0).ry < 0, "right ⇒ ry < 0");
  assert(at(-(HX + 10), 0).ry > 0, "left ⇒ ry > 0");
  assertEquals(at(HX + 10, 0).rx, 0);
});

Deno.test("tilt strength decays monotonically with distance outside", () => {
  const near = Math.abs(at(HX + REACH * 0.25, 0).ry);
  const mid = Math.abs(at(HX + REACH * 0.5, 0).ry);
  const far = Math.abs(at(HX + REACH * 0.75, 0).ry);
  assert(near > mid && mid > far && far > 0);
});

Deno.test("continuity across the border box edge", () => {
  const eps = 1e-3;
  const inside = at(HX - eps, 0);
  const outside = at(HX + eps, 0);
  assertAlmostEquals(inside.ry, outside.ry, 0.01);
  assertAlmostEquals(inside.lift, outside.lift, 0.01);
});

Deno.test("continuity through the center — no pop when crossing", () => {
  const justLeft = at(-2, 0);
  const justRight = at(2, 0);
  assert(Math.abs(justLeft.ry) < 0.1);
  assert(Math.abs(justRight.ry) < 0.1);
  assert(
    Math.sign(justLeft.ry) !== Math.sign(justRight.ry) || justLeft.ry === 0,
  );
});

Deno.test("maxTilt is never exceeded anywhere in the field", () => {
  const maxYaw = clamp(TILT * (HY / HX), Math.min(1, TILT), TILT);
  for (let px = -(HX + REACH); px <= HX + REACH; px += 7) {
    for (let py = -(HY + REACH); py <= HY + REACH; py += 7) {
      const t = at(px, py);
      assert(Math.abs(t.rx) <= TILT + 1e-9, `rx bound at ${px},${py}`);
      assert(Math.abs(t.ry) <= maxYaw + 1e-9, `ry bound at ${px},${py}`);
      assert(t.lift <= LIFT + 1e-9 && t.lift >= 0, `lift bound at ${px},${py}`);
    }
  }
});

Deno.test("custom force shape is honored (linear vs default smoothstep)", () => {
  const px = HX + REACH * 0.75; // t = 0.25
  const linear = fieldTargets(px, 0, HX, HY, REACH, TILT, LIFT, (t) => t);
  const dflt = at(px, 0);
  const maxYaw = clamp(TILT * (HY / HX), Math.min(1, TILT), TILT);
  assertAlmostEquals(Math.abs(linear.ry), maxYaw * 0.25, 1e-6);
  // smoothstep(0.25) ≈ 0.156
  assert(Math.abs(dflt.ry) < Math.abs(linear.ry));
});

Deno.test("force shape output is clamped — maxTilt still holds", () => {
  const t = fieldTargets(HX + 10, 0, HX, HY, REACH, TILT, LIFT, () => 5);
  const maxYaw = clamp(TILT * (HY / HX), Math.min(1, TILT), TILT);
  assert(Math.abs(t.ry) <= maxYaw + 1e-9, `ry ${t.ry}`);
  assert(t.lift <= LIFT + 1e-9, `lift ${t.lift}`);
});

Deno.test("equal-edge-lift rule: full yaw on a square, reduced on a wide button", () => {
  const sq = fieldTargets(24, 0, 24, 24, 48, TILT, LIFT);
  assertAlmostEquals(Math.abs(sq.ry), TILT, 0.05);
  const wide = at(HX, 0);
  assertAlmostEquals(Math.abs(wide.ry), TILT * (HY / HX), 0.05);
});
