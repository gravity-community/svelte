/** Sizes, smallest first. */
export const CHOICE_SIZES = ["sm", "md"] as const;

export type ChoiceSize = (typeof CHOICE_SIZES)[number];

/** A card of the choice: its value, its title and, optionally, what it means. */
export type ChoiceItem<V extends string = string> = {
  readonly value: V;
  readonly title: string;
  readonly description?: string;
  readonly disabled?: boolean;
};
