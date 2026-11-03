import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { createTV } from "tailwind-variants";

export type { VariantProps } from "tailwind-variants";

const typeScale = [
  "display",
  "title-xl",
  "title",
  "heading",
  "subheading",
  "label",
  "overline",
];

const twMergeConfig = {
  extend: {
    // Without these, tailwind-merge reads `text-title` as a colour and drops `text-fg`.
    theme: {
      text: typeScale,
      leading: typeScale,
      spacing: ["xxs", "sm", "md", "lg", "xl", "2xl"],
      animate: ["caret-blink"],
    },
    classGroups: { transition: ["transition-interactive"] },
  },
  // In Tailwind 4 an explicit leading-* beats a text-* size's line height in any order.
  override: { conflictingClassGroups: { "font-size": [] } },
};

const twMerge = extendTailwindMerge(twMergeConfig);

export const tv = createTV({ twMergeConfig });

/** Joins class values (strings, arrays, objects) and resolves Tailwind conflicts, last wins. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
