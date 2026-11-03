import { assertEquals } from "@std/assert";
import { FLICK_VELOCITY, resolveSnap } from "./snap.ts";

// A 460px sheet with a 132px peek.
const PEEK_OFFSET = 328;

Deno.test("resolveSnap: slow release snaps to the nearer rest position", () => {
  assertEquals(resolveSnap(60, PEEK_OFFSET, 0), "expanded");
  assertEquals(resolveSnap(300, PEEK_OFFSET, 0), "peek");
  // The exact midpoint stays expanded.
  assertEquals(resolveSnap(PEEK_OFFSET / 2, PEEK_OFFSET, 0), "expanded");
});

Deno.test("resolveSnap: a fast flick commits in its direction from anywhere", () => {
  assertEquals(resolveSnap(20, PEEK_OFFSET, FLICK_VELOCITY), "peek");
  assertEquals(resolveSnap(310, PEEK_OFFSET, -FLICK_VELOCITY), "expanded");
});

Deno.test("resolveSnap: a sub-threshold flick falls back to position", () => {
  assertEquals(resolveSnap(20, PEEK_OFFSET, FLICK_VELOCITY - 1), "expanded");
  assertEquals(resolveSnap(310, PEEK_OFFSET, -(FLICK_VELOCITY - 1)), "peek");
});
