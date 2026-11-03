import type { DotIntent } from "../dot/types.ts";

export type SelectItem = {
  value: string;
  label: string;
  disabled?: boolean;
  /** A status dot before the label; `label` is announced, the dot is not. */
  status?: { intent: DotIntent; filled?: boolean; label: string };
};

/** Options listed together under an optional heading, set apart from the rest by a rule. */
export type SelectGroup = { label?: string; items: SelectItem[] };
