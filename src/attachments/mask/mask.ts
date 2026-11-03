import { Maskito, type MaskitoOptions, maskitoTransform } from "@maskito/core";
import type { Attachment } from "svelte/attachments";

/** Keeps an input's value in a mask's format as it is typed, pasted or undone, starting from the value it has. */
export function mask(options: MaskitoOptions): Attachment<HTMLInputElement> {
  return (input) => {
    // Maskito formats only the user's edits, so a value set before it attaches is formatted here.
    const formatted = maskitoTransform(input.value, options);
    if (formatted !== input.value) {
      input.value = formatted;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const maskito = new Maskito(input, options);
    return () => maskito.destroy();
  };
}
