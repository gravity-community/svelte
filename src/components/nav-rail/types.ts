import type { AvatarVariant } from "../avatar/field.ts";
import type { IconGlyph } from "../icon/glyphs.ts";

export type NavRailItem = {
  href: string;
  label: string;
  glyph: IconGlyph;
  active?: boolean;
  /** Unread dot on the glyph. */
  dot?: boolean;
};

export type NavRailUser = {
  id: string;
  name: string;
  /** Display label only; derive it and `avatarVariant` from one value so they agree. */
  role: string;
  avatarVariant: AvatarVariant;
  organization?: string;
};

/** Height (px) of the mobile bottom bar, NavRail's `h-16`; fixed chrome below `lg` reserves it. */
export const NAV_RAIL_BAR_HEIGHT = 64;
