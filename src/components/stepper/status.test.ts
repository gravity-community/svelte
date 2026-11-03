import { assertEquals } from "@std/assert";
import { statusOf } from "./status.ts";

Deno.test("steps before current are done and after it upcoming", () => {
  const steps = [{ label: "a" }, { label: "b" }, { label: "c" }];
  assertEquals(
    steps.map((step, index) => statusOf(step, index, 1)),
    ["done", "current", "upcoming"],
  );
});

Deno.test("a step's own status wins", () => {
  assertEquals(statusOf({ label: "a", status: "error" }, 0, 2), "error");
  assertEquals(statusOf({ label: "c", status: "done" }, 2, 0), "done");
});
