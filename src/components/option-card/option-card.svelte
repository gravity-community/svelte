<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const energyRange = ["2", "1"] as const;
// The chip matches the card, one level higher while selected.
const lifted = { "2": "3", "1": "2" } as const;

const optionCard = tv({
  slots: {
    base:
      "flex w-full items-center gap-4 rounded-2xl border border-transparent p-4 no-underline transition-colors",
    chip: "flex size-10 shrink-0 items-center justify-center rounded-[10px]",
    title: "text-[15px] leading-tight font-semibold",
    description: "text-[13px] leading-snug text-muted-fg",
    caret: "size-5 shrink-0 text-subtle-fg",
  },
  variants: {
    energy: {
      "2": { title: "text-fg" },
      "1": { title: "text-quiet-fg" },
    },
    intent: {
      neutral: "",
      primary: "",
      info: "",
      success: "",
      warning: "",
      danger: "",
    },
    state: {
      idle: "",
      // The 2px edge takes 1px of padding, so the card keeps its size.
      selected: {
        base: "filled-well border-2 p-[15px] forced-colors:border-[Highlight]",
      },
      // A filled well, so the chip's glaze stands off the grey box.
      disabled: {
        base: "filled-well cursor-not-allowed bg-surface-muted",
        chip:
          "bg-neutral-subtle text-disabled-fg forced-colors:text-[GrayText]",
        title: "text-disabled-fg",
        description: "text-disabled-fg",
        caret: "text-disabled-fg forced-colors:text-[GrayText]",
      },
    },
    chipLevel: { "3": "", "2": "", "1": { chip: "bg-plate" } },
  },
  // deno-fmt-ignore
  compoundVariants: [
    { state: "idle", energy: "2", intent: "neutral", class: { base: "filled-well bg-well hover:bg-well-active" } },
    { state: "idle", energy: "2", intent: "primary", class: { base: "filled-well bg-primary-subtle hover:bg-primary-subtle-hover" } },
    { state: "idle", energy: "2", intent: "info", class: { base: "filled-well bg-info-subtle hover:bg-info-subtle-hover" } },
    { state: "idle", energy: "2", intent: "success", class: { base: "filled-well bg-success-subtle hover:bg-success-subtle-hover" } },
    { state: "idle", energy: "2", intent: "warning", class: { base: "filled-well bg-warning-subtle hover:bg-warning-subtle-hover" } },
    { state: "idle", energy: "2", intent: "danger", class: { base: "filled-well bg-danger-subtle hover:bg-danger-subtle-hover" } },
    { state: "idle", energy: "1", intent: "neutral", class: { base: "border-neutral-subtle hover:bg-well" } },
    { state: "idle", energy: "1", intent: "primary", class: { base: "filled-well bg-plate hover:bg-primary-subtle" } },
    { state: "idle", energy: "1", intent: "info", class: { base: "filled-well bg-plate hover:bg-info-subtle" } },
    { state: "idle", energy: "1", intent: "success", class: { base: "filled-well bg-plate hover:bg-success-subtle" } },
    { state: "idle", energy: "1", intent: "warning", class: { base: "filled-well bg-plate hover:bg-warning-subtle" } },
    { state: "idle", energy: "1", intent: "danger", class: { base: "filled-well bg-plate hover:bg-danger-subtle" } },
    { state: "selected", intent: "primary", class: { base: "border-border-focus bg-primary-subtle" } },
    { state: "selected", intent: "info", class: { base: "border-info-solid bg-info-subtle" } },
    { state: "selected", intent: "success", class: { base: "border-success-solid bg-success-subtle" } },
    { state: "selected", intent: "warning", class: { base: "border-warning-solid bg-warning-subtle" } },
    { state: "selected", intent: "danger", class: { base: "border-danger-solid bg-danger-subtle" } },
    { chipLevel: "3", intent: "primary", class: { chip: "bg-primary-solid text-on-primary" } },
    { chipLevel: "3", intent: "info", class: { chip: "bg-info-solid text-on-info" } },
    { chipLevel: "3", intent: "success", class: { chip: "bg-success-solid text-on-success" } },
    { chipLevel: "3", intent: "warning", class: { chip: "bg-warning-solid text-on-warning" } },
    { chipLevel: "3", intent: "danger", class: { chip: "bg-danger-solid text-on-danger" } },
    { chipLevel: "2", intent: "neutral", class: { chip: "bg-neutral-deep text-neutral-strong" } },
    { chipLevel: "2", intent: "primary", class: { chip: "bg-primary-deep text-primary-strong" } },
    { chipLevel: "2", intent: "info", class: { chip: "bg-info-deep text-info-strong" } },
    { chipLevel: "2", intent: "success", class: { chip: "bg-success-deep text-success-strong" } },
    { chipLevel: "2", intent: "warning", class: { chip: "bg-warning-deep text-warning-strong" } },
    { chipLevel: "2", intent: "danger", class: { chip: "bg-danger-deep text-danger-strong" } },
    { chipLevel: "1", intent: "neutral", class: { chip: "text-neutral-glyph-faint" } },
    { chipLevel: "1", intent: "primary", class: { chip: "text-primary-glyph-faint" } },
    { chipLevel: "1", intent: "info", class: { chip: "text-info-glyph-faint" } },
    { chipLevel: "1", intent: "success", class: { chip: "text-success-glyph-faint" } },
    { chipLevel: "1", intent: "warning", class: { chip: "text-warning-glyph-faint" } },
    { chipLevel: "1", intent: "danger", class: { chip: "text-danger-glyph-faint" } },
  ],
});
</script>

<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";
import { type Energy, resolveEnergy } from "../../utils/energy.ts";
import Icon from "../icon/icon.svelte";
import type { CardIntent } from "./types.ts";

type Props =
  & HTMLAttributes<HTMLElement>
  & {
    energy?: Energy<(typeof energyRange)[number]>;
    intent?: CardIntent;
    title: string;
    description?: string;
    /** A 20px glyph for the leading chip. */
    icon?: Snippet;
    selected?: boolean;
    disabled?: boolean;
    href?: string;
  };

let {
  title,
  description,
  icon,
  energy,
  intent = "neutral",
  selected = false,
  disabled = false,
  href,
  class: className,
  ...rest
}: Props = $props();

const link = $derived(href && !disabled ? href : undefined);
const level = $derived(resolveEnergy(energy, energyRange));
const styles = $derived(
  optionCard({
    energy: level,
    // A neutral card selects in primary.
    intent: selected && intent === "neutral" ? "primary" : intent,
    state: disabled ? "disabled" : selected ? "selected" : "idle",
    chipLevel: disabled ? undefined : selected ? lifted[level] : level,
  }),
);
</script>

<svelte:element
  this={link ? "a" : "div"}
  href={link}
  aria-current={link && selected ? "true" : undefined}
  aria-disabled={disabled || undefined}
  class={cn(styles.base(), className)}
  {...rest}
>
  <span class={styles.chip()} aria-hidden="true">
    <span class="flex size-5 items-center justify-center">
      {@render icon?.()}
    </span>
  </span>
  <span class="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
    <span class={styles.title()}>{title}</span>
    {#if description}
      <span class={styles.description()}>{description}</span>
    {/if}
  </span>
  <Icon glyph={disabled ? "lock" : "caret-right"} class={styles.caret()} />
</svelte:element>
