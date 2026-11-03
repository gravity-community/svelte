import { assert, assertAlmostEquals, assertEquals } from "@std/assert";
import {
  createVelocityState,
  stepPointerVelocity,
} from "./pointer-velocity.ts";

Deno.test("first sample only primes position — velocity stays zero", () => {
  const s = createVelocityState();
  stepPointerVelocity(s, 100, 50, 0);
  assertEquals(s.vx, 0);
  assertEquals(s.vy, 0);
  assertEquals(s.lastX, 100);
  assertEquals(s.lastT, 0);
});

Deno.test("EMA converges toward the instantaneous velocity", () => {
  const s = createVelocityState();
  stepPointerVelocity(s, 0, 0, 0);
  // 1000 px/s; EMA (α = 0.4): 400, 640, 784, … → 1000.
  stepPointerVelocity(s, 100, 0, 100);
  assertAlmostEquals(s.vx, 400, 1e-9);
  stepPointerVelocity(s, 200, 0, 200);
  assertAlmostEquals(s.vx, 640, 1e-9);
  for (let i = 3; i < 40; i++) stepPointerVelocity(s, i * 100, 0, i * 100);
  assert(s.vx > 990 && s.vx < 1010, `expected ~1000, got ${s.vx}`);
  assertEquals(s.vy, 0);
});

Deno.test("zero time delta is ignored (no divide-by-zero)", () => {
  const s = createVelocityState();
  stepPointerVelocity(s, 0, 0, 100);
  stepPointerVelocity(s, 50, 0, 100);
  assert(Number.isFinite(s.vx));
  assertEquals(s.vx, 0);
  assertEquals(s.lastX, 50);
});

Deno.test("tracks both axes independently", () => {
  const s = createVelocityState();
  stepPointerVelocity(s, 0, 0, 0);
  stepPointerVelocity(s, 100, -200, 100);
  assertAlmostEquals(s.vx, 400, 1e-9);
  assertAlmostEquals(s.vy, -800, 1e-9);
});
