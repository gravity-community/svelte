import { assert, assertAlmostEquals, assertFalse } from "@std/assert";
import { edgeSprings, movesForward, travels } from "./travel.ts";
import { UI_SPRING } from "../../motion/spring.ts";

Deno.test("direction is read from the box centre, not an edge", () => {
  const from = { start: 0, end: 40 };
  assert(movesForward(from, { start: 46, end: 108 }));
  assertFalse(movesForward({ start: 46, end: 108 }, from));
  // The neighbour's near edge is behind, yet its centre is ahead.
  assert(movesForward({ start: 0, end: 200 }, { start: 150, end: 260 }));
});

Deno.test("the edge moved toward is the one that leads", () => {
  const forward = edgeSprings(true);
  assert(forward.end.stiffness > forward.start.stiffness);
  const back = edgeSprings(false);
  assert(back.start.stiffness > back.end.stiffness);
});

Deno.test("the leading edge holds UI_SPRING's damping ratio", () => {
  const zeta = (s: { stiffness: number; damping: number }) =>
    s.damping / (2 * Math.sqrt(s.stiffness));
  assertAlmostEquals(zeta(edgeSprings(true).end), zeta(UI_SPRING), 1e-12);
});

Deno.test("only a genuine change between two live targets travels", () => {
  assert(travels(true, "ui", "cli", false));
  // First placement, re-measure, reduced motion.
  assertFalse(travels(false, undefined, "cli", false));
  assertFalse(travels(true, "cli", "cli", false));
  assertFalse(travels(true, "ui", "cli", true));
});
