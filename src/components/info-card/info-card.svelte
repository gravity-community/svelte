<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const energyRange = ["2", "1"] as const;

const infoCard = tv({
  slots: {
    base: "flex flex-col items-start rounded-xl border border-transparent p-5",
    chip: "mb-5 flex size-10 items-center justify-center rounded-[10px]",
    title: "text-sm leading-5 font-medium",
  },
  variants: {
    energy: {
      "2": { title: "text-fg" },
      "1": { chip: "bg-plate", title: "text-quiet-fg" },
    },
    intent: {
      neutral: "",
      primary: "",
      info: "",
      success: "",
      warning: "",
      danger: "",
    },
  },
  // deno-fmt-ignore
  compoundVariants: [
    { energy: "2", intent: "neutral", class: { base: "filled-well bg-well", chip: "bg-neutral-deep text-neutral-strong" } },
    { energy: "2", intent: "primary", class: { base: "filled-well bg-primary-subtle", chip: "bg-primary-deep text-primary-strong" } },
    { energy: "2", intent: "info", class: { base: "filled-well bg-info-subtle", chip: "bg-info-deep text-info-strong" } },
    { energy: "2", intent: "success", class: { base: "filled-well bg-success-subtle", chip: "bg-success-deep text-success-strong" } },
    { energy: "2", intent: "warning", class: { base: "filled-well bg-warning-subtle", chip: "bg-warning-deep text-warning-strong" } },
    { energy: "2", intent: "danger", class: { base: "filled-well bg-danger-subtle", chip: "bg-danger-deep text-danger-strong" } },
    { energy: "1", intent: "neutral", class: { base: "border-neutral-subtle", chip: "text-neutral-glyph-faint" } },
    { energy: "1", intent: "primary", class: { base: "filled-well bg-plate", chip: "text-primary-glyph-faint" } },
    { energy: "1", intent: "info", class: { base: "filled-well bg-plate", chip: "text-info-glyph-faint" } },
    { energy: "1", intent: "success", class: { base: "filled-well bg-plate", chip: "text-success-glyph-faint" } },
    { energy: "1", intent: "warning", class: { base: "filled-well bg-plate", chip: "text-warning-glyph-faint" } },
    { energy: "1", intent: "danger", class: { base: "filled-well bg-plate", chip: "text-danger-glyph-faint" } },
  ],
  defaultVariants: { intent: "neutral" },
});
</script>

<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";
import { type Energy, resolveEnergy } from "../../utils/energy.ts";
import type { CardIntent } from "../option-card/types.ts";

type Props =
  & Omit<HTMLAttributes<HTMLDivElement>, "title">
  & {
    energy?: Energy<(typeof energyRange)[number]>;
    intent?: CardIntent;
    title: string;
    meta?: string;
    /** A 24px glyph, shown above the title in a chip that matches the card. */
    icon?: Snippet;
  };

let { energy, intent, title, meta, icon, class: className, ...rest }: Props =
  $props();

const level = $derived(resolveEnergy(energy, energyRange));
const styles = $derived(infoCard({ energy: level, intent }));
</script>

<div class={cn(styles.base(), className)} {...rest}>
  {#if icon}
    <span class={styles.chip()} aria-hidden="true">
      <span class="flex size-6 items-center justify-center">{@render icon()}</span>
    </span>
  {/if}
  <span class={styles.title()}>{title}</span>
  {#if meta}
    <span class="mt-1 text-[13px] leading-5 text-muted-fg">{meta}</span>
  {/if}
</div>
