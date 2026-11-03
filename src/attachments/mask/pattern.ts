import type { MaskitoOptions } from "@maskito/core";

const SLOTS: Record<string, RegExp> = {
  "#": /\d/,
  A: /[\dA-Za-z]/,
  a: /[\dA-Za-z]/,
};

/** Mask options for a pattern: `#` a digit, `A` / `a` a letter or digit shown in capitals / lower case; any other character is inserted as the user types. */
export function patternMask(pattern: string): MaskitoOptions {
  const slots = [...pattern];
  return {
    mask: slots.map((slot) => SLOTS[slot] ?? slot),
    postprocessors: [
      ({ value, selection }) => ({
        value: [...value].map((char, i) => cased(char, slots[i])).join(""),
        selection,
      }),
    ],
  };
}

function cased(char: string, slot: string | undefined): string {
  if (slot === "A") return char.toUpperCase();
  if (slot === "a") return char.toLowerCase();
  return char;
}
