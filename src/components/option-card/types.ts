/** Intents a card takes, neutral (the default) first. */
export const CARD_INTENTS = [
  "neutral",
  "primary",
  "info",
  "success",
  "warning",
  "danger",
] as const;

export type CardIntent = (typeof CARD_INTENTS)[number];
