<script module lang="ts">
import type { IconGlyph } from "../icon/glyphs.ts";
import type { TierChipTier } from "./types.ts";

const TIERS: Record<TierChipTier, { label: string; glyph: IconGlyph }> = {
  "1": { label: "Limited public view", glyph: "eye" },
  "2": { label: "Limited private view", glyph: "user-check" },
  "3": { label: "Full private view", glyph: "shield-check" },
};
</script>

<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";
import Icon from "../icon/icon.svelte";

type Props = HTMLAttributes<HTMLSpanElement> & { tier: TierChipTier };

let { tier, class: className, ...rest }: Props = $props();

const { label, glyph } = $derived(TIERS[tier]);
</script>

<span
  class={cn(
    "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-[5px] text-fg",
    className,
  )}
  {...rest}
>
  <Icon {glyph} class="size-3.5 shrink-0" />
  <span class="text-xs font-medium whitespace-nowrap">{label}</span>
</span>
