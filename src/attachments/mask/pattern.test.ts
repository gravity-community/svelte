import { assertEquals } from "@std/assert";
import { maskitoTransform } from "@maskito/core";
import { patternMask } from "./pattern.ts";

Deno.test("a pattern inserts its fixed characters around the digits", () => {
  assertEquals(
    maskitoTransform("27082440", patternMask("### ## ###")),
    "270 82 440",
  );
  assertEquals(
    maskitoTransform("270 82 440", patternMask("### ## ###")),
    "270 82 440",
  );
});

Deno.test("a pattern drops what its slots don't take, and stops at its length", () => {
  assertEquals(maskitoTransform("1a2b3", patternMask("###")), "123");
  assertEquals(maskitoTransform("123456", patternMask("### ##")), "123 45");
});

Deno.test("letter slots set the case", () => {
  assertEquals(maskitoTransform("ab12", patternMask("AAAA")), "AB12");
  assertEquals(maskitoTransform("AB12", patternMask("aaaa")), "ab12");
});
