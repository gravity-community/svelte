import { assertEquals } from "@std/assert";
import { ENERGY, type Energy, type Level, resolveEnergy } from "./energy.ts";

const FIELD = ["2", "1"] as const;
const STATUS = ["2", "1", "0"] as const;

Deno.test("levels run from solid, 3, down to ghost, 0", () => {
  assertEquals(ENERGY, ["3", "2", "1", "0"]);
});

Deno.test("with no energy a component sits at its potential on the blank page", () => {
  assertEquals(resolveEnergy(undefined, ENERGY), "3");
  assertEquals(resolveEnergy(undefined, FIELD), "2");
  assertEquals(resolveEnergy(undefined, STATUS), "2");
});

Deno.test("the page and overlays leave every absolute level as given", () => {
  for (const level of ENERGY) assertEquals(resolveEnergy(level, ENERGY), level);
});

Deno.test("a shift counts from the potential and stays within the range", () => {
  assertEquals(resolveEnergy("-1", ENERGY), "2");
  assertEquals(resolveEnergy("-3", ENERGY), "0");
  assertEquals(resolveEnergy("-1", FIELD), "1");
  assertEquals(resolveEnergy("-2", FIELD), "1");
  assertEquals(resolveEnergy("-1", STATUS), "1");
  assertEquals(resolveEnergy("+1", ENERGY), "3");
});

Deno.test("a card on the page drops a 3 Button to 2, a 1 Button to 0 and an Input to 1", () => {
  assertEquals(resolveEnergy("3", ENERGY, 1), "2");
  assertEquals(resolveEnergy("1", ENERGY, 1), "0");
  assertEquals(resolveEnergy(undefined, FIELD, 1), "1");
});

Deno.test("+1 lifts an element back toward its potential inside a well", () => {
  assertEquals(resolveEnergy("+1", ENERGY, 1), "3");
  assertEquals(resolveEnergy("+1", ENERGY, 2), "2");
  assertEquals(resolveEnergy("+1", FIELD, 1), "2");
});

Deno.test("deeper wells keep dropping a level until the ground", () => {
  const byDepth = <R extends readonly Level[]>(
    energy: Energy<R[number]> | undefined,
    range: R,
  ) => [0, 1, 2, 3].map((depth) => resolveEnergy(energy, range, depth));
  assertEquals(byDepth(undefined, ENERGY), ["3", "2", "1", "0"]);
  assertEquals(byDepth("1", ENERGY), ["1", "0", "0", "0"]);
  assertEquals(byDepth("-1", ENERGY), ["2", "1", "0", "0"]);
  assertEquals(byDepth(undefined, STATUS), ["2", "1", "0", "0"]);
  assertEquals(byDepth("0", STATUS), ["0", "0", "0", "0"]);
  assertEquals(byDepth(undefined, FIELD), ["2", "1", "1", "1"]);
});

Deno.test("an absolute level outside the component's range doesn't type-check", () => {
  // @ts-expect-error 0 is below a field's ground
  resolveEnergy("0", FIELD);
  // @ts-expect-error 3 is above Status's potential
  resolveEnergy("3", STATUS);
});
