import { assert, assertAlmostEquals } from "@std/assert";
import {
  isSettled,
  MAX_FRAME_DELTA,
  SPRING_SUBSTEP,
  stepSpring,
  substepCount,
} from "./spring.ts";
import type { SpringState } from "./spring.ts";

// Gravity's constants, copied so the motion core doesn't depend on attachments/.
const STIFFNESS = 360;
const DAMPING = 21; // ζ ≈ 0.55
const LIFT_STIFFNESS = 360;
const LIFT_DAMPING = 34; // ζ ≈ 0.90

Deno.test("spring release from 4°: crosses zero (overshoot), settles < 600 ms", () => {
  const s: SpringState = { x: 4, v: 0 };
  let minX = s.x;
  let t = 0;
  while (!isSettled(s, 0, 0.01, 0.1)) {
    stepSpring(s, 0, STIFFNESS, DAMPING, SPRING_SUBSTEP);
    t += SPRING_SUBSTEP;
    minX = Math.min(minX, s.x);
    assert(t < 5, "spring failed to settle");
  }
  assert(minX < -0.05, `overshoot expected, min was ${minX}`);
  assert(minX > -0.8, `overshoot too violent: ${minX} (≈12% of 4° expected)`);
  assert(t < 0.6, `settle took ${t.toFixed(3)}s`);
});

Deno.test("overdamped lift spring: no overshoot past 5%", () => {
  const s: SpringState = { x: 6, v: 0 };
  let minX = s.x;
  let t = 0;
  while (!isSettled(s, 0, 0.02, 0.2)) {
    stepSpring(s, 0, LIFT_STIFFNESS, LIFT_DAMPING, SPRING_SUBSTEP);
    t += SPRING_SUBSTEP;
    minX = Math.min(minX, s.x);
    assert(t < 5, "lift spring failed to settle");
  }
  assert(minX > -0.3, `lift overshot: ${minX}`);
});

Deno.test("fixed-substep integration is frame-rate invariant", () => {
  const total = 1; // s
  const run = (frameDt: number): { x: number; steps: number } => {
    const s: SpringState = { x: 4, v: 0 };
    const clock = { acc: 0 };
    let steps = 0;
    for (let t = 0; t < total; t += frameDt) {
      const n = substepCount(clock, frameDt);
      steps += n;
      for (let i = 0; i < n; i++) {
        stepSpring(s, 0, STIFFNESS, DAMPING, SPRING_SUBSTEP);
      }
    }
    return { x: s.x, steps };
  };
  const at60 = run(1 / 60);
  const at144 = run(1 / 144);
  assert(
    Math.abs(at60.steps - at144.steps) <= 1,
    `${at60.steps} vs ${at144.steps} substeps`,
  );
  assertAlmostEquals(at60.x, at144.x, 0.02);
});

Deno.test("frame delta is clamped (tab-restore protection)", () => {
  const clock = { acc: 0 };
  const n = substepCount(clock, 5);
  assert(
    n <= Math.ceil(MAX_FRAME_DELTA / SPRING_SUBSTEP),
    `integrated ${n} substeps after a hang`,
  );
});
