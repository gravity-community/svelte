<script module lang="ts">
import { tv } from "../../utils/classes.ts";
import type { IconCircleIntent } from "./types.ts";

const iconCircle = tv({
  slots: {
    base: "flex shrink-0 items-center justify-center rounded-full",
    glyph: "flex items-center justify-center",
    text: "leading-none font-medium tabular-nums",
  },
  variants: {
    // Ghost is {}, not "": a string value lists ghost first in Storybook's props table.
    energy: {
      "3": { base: "forced-colors:border" },
      "2": { base: "forced-colors:border" },
      "1": { base: "bg-plate forced-colors:border" },
      "0": {},
    },
    // The ink of soft; solid cuts its content out, faint and ghost step it down (the glyph rule).
    intent: {
      primary: { base: "text-primary-strong" },
      neutral: { base: "text-neutral-strong" },
      info: { base: "text-info-strong" },
      success: { base: "text-success-strong" },
      warning: { base: "text-warning-strong" },
      danger: { base: "text-danger-strong" },
    } satisfies Record<IconCircleIntent, { base: string }>,
    size: {
      sm: { base: "size-7", glyph: "size-3.5", text: "text-xs" },
      md: { base: "size-10", glyph: "size-5", text: "text-sm" },
      lg: { base: "size-16", glyph: "size-7", text: "text-base" },
      xl: { base: "size-20", glyph: "size-9", text: "text-lg" },
    },
    // Soft on a fill of its own intent, which the energy scope reports.
    onFill: { true: {} },
  },
  // deno-fmt-ignore
  compoundVariants: [
    { energy: "3", intent: "primary", class: { base: "bg-primary-solid text-on-primary" } },
    { energy: "3", intent: "neutral", class: { base: "bg-neutral-solid text-on-neutral" } },
    { energy: "3", intent: "info", class: { base: "bg-info-solid text-on-info" } },
    { energy: "3", intent: "success", class: { base: "bg-success-solid text-on-success" } },
    { energy: "3", intent: "warning", class: { base: "bg-warning-solid text-on-warning" } },
    { energy: "3", intent: "danger", class: { base: "bg-danger-solid text-on-danger" } },
    { energy: "2", intent: "primary", class: { base: "bg-primary-subtle" } },
    { energy: "2", intent: "neutral", class: { base: "bg-neutral-subtle" } },
    { energy: "2", intent: "info", class: { base: "bg-info-subtle" } },
    { energy: "2", intent: "success", class: { base: "bg-success-subtle" } },
    { energy: "2", intent: "warning", class: { base: "bg-warning-subtle" } },
    { energy: "2", intent: "danger", class: { base: "bg-danger-subtle" } },
    { energy: "2", onFill: true, intent: "primary", class: { base: "bg-primary-deep" } },
    { energy: "2", onFill: true, intent: "neutral", class: { base: "bg-neutral-deep" } },
    { energy: "2", onFill: true, intent: "info", class: { base: "bg-info-deep" } },
    { energy: "2", onFill: true, intent: "success", class: { base: "bg-success-deep" } },
    { energy: "2", onFill: true, intent: "warning", class: { base: "bg-warning-deep" } },
    { energy: "2", onFill: true, intent: "danger", class: { base: "bg-danger-deep" } },
    { energy: "1", intent: "primary", class: { base: "text-primary-glyph-faint" } },
    { energy: "1", intent: "neutral", class: { base: "text-neutral-glyph-faint" } },
    { energy: "1", intent: "info", class: { base: "text-info-glyph-faint" } },
    { energy: "1", intent: "success", class: { base: "text-success-glyph-faint" } },
    { energy: "1", intent: "warning", class: { base: "text-warning-glyph-faint" } },
    { energy: "1", intent: "danger", class: { base: "text-danger-glyph-faint" } },
    { energy: "0", intent: "primary", class: { base: "text-primary-glyph-ghost" } },
    { energy: "0", intent: "neutral", class: { base: "text-neutral-glyph-ghost" } },
    { energy: "0", intent: "info", class: { base: "text-info-glyph-ghost" } },
    { energy: "0", intent: "success", class: { base: "text-success-glyph-ghost" } },
    { energy: "0", intent: "warning", class: { base: "text-warning-glyph-ghost" } },
    { energy: "0", intent: "danger", class: { base: "text-danger-glyph-ghost" } },
  ],
  defaultVariants: { size: "md" },
});
</script>

<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";
import { ENERGY, type Energy, resolveEnergy } from "../../utils/energy.ts";
import { getEnergyScope } from "../../utils/energy-scope.ts";

type Props =
  & HTMLAttributes<HTMLSpanElement>
  & Pick<VariantProps<typeof iconCircle>, "intent" | "size">
  & {
    energy?: Energy;
    /** A currentColor glyph; the circle sizes it. */
    children?: Snippet;
    /** One to three characters, such as a count ("3", "99+"), shown instead of children; the circle is aria-hidden, so state the meaning in text nearby. */
    text?: string;
  };

let {
  energy,
  intent = "neutral",
  size,
  text,
  class: className,
  children,
  ...rest
}: Props = $props();

const scope = getEnergyScope();
const level = $derived(resolveEnergy(energy ?? scope()?.level, ENERGY));
const onFill = $derived(level === "2" && scope()?.fill === intent);
const styles = $derived(iconCircle({ energy: level, intent, size, onFill }));
</script>

<span class={cn(styles.base(), className)} aria-hidden="true" {...rest}>
  {#if text}
    <span class={styles.text()}>{text}</span>
  {:else}
    <span class={styles.glyph()}>{@render children?.()}</span>
  {/if}
</span>
