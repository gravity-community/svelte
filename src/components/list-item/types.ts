import type { DotIntent } from "../dot/types.ts";

export type ListItemStatus = {
  intent: DotIntent;
  filled?: boolean;
  /** Announced ahead of the meta; leave it out when the meta already says what the dot means. */
  label?: string;
};
