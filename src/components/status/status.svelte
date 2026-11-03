<script module lang="ts">
import { tv } from "../../utils/classes.ts";
import type { IconGlyph } from "../icon/glyphs.ts";

// Type is size-invariant: size scales the circle, the gaps, the actions and the box's padding.
const energyRange = ["2", "1", "0"] as const;

const status = tv({
  slots: {
    base: "flex flex-col items-center text-center",
    circle: "",
    content: "flex flex-col items-center",
    eyebrow: "font-mono text-[11px] tracking-[0.08em]",
    title: "font-sans text-xl leading-tight font-semibold",
    body: "font-sans text-[13px] text-muted-fg",
    rule: "h-px shrink-0 bg-border-hairline",
    actions: "flex",
  },
  variants: {
    // Both boxes are filled wells, so the parts on them glaze.
    energy: {
      "2": {
        base: "filled-well rounded-2xl forced-colors:border",
        title: "text-fg",
      },
      "1": {
        base: "filled-well rounded-2xl bg-plate forced-colors:border",
        title: "text-quiet-fg",
      },
      "0": { title: "text-quiet-fg" },
    },
    intent: {
      neutral: { eyebrow: "text-neutral-strong" },
      info: { eyebrow: "text-info-strong" },
      success: { eyebrow: "text-success-strong" },
      warning: { eyebrow: "text-warning-strong" },
      danger: { eyebrow: "text-danger-strong" },
    },
    size: {
      sm: {
        base: "gap-3",
        content: "gap-1",
        body: "max-w-[280px]",
        rule: "w-12",
        actions: "gap-2",
      },
      md: {
        base: "gap-4",
        content: "gap-2",
        body: "max-w-[460px]",
        rule: "w-16",
        actions: "gap-3",
      },
      lg: {
        base: "gap-5",
        content: "gap-2",
        body: "max-w-[520px]",
        rule: "w-[72px]",
        actions: "gap-3",
      },
    },
    pulse: { true: { circle: "motion-safe:animate-status-pulse" } },
    actionsLayout: {
      inline: { actions: "items-center justify-center" },
      stretch: { actions: "w-full flex-col" },
    },
  },
  // Ghost has no box, so it drops the box's padding too. A pulsing glyph keeps
  // the strong ink, which clears 3:1 at the trough of the pulse.
  // deno-fmt-ignore
  compoundVariants: [
    { energy: "2", intent: "neutral", class: { base: "bg-neutral-subtle" } },
    { energy: "2", intent: "info", class: { base: "bg-info-subtle" } },
    { energy: "2", intent: "success", class: { base: "bg-success-subtle" } },
    { energy: "2", intent: "warning", class: { base: "bg-warning-subtle" } },
    { energy: "2", intent: "danger", class: { base: "bg-danger-subtle" } },
    { energy: "0", intent: "neutral", class: { eyebrow: "text-muted-fg" } },
    { energy: "0", intent: "info", class: { eyebrow: "text-info-quiet" } },
    { energy: "0", intent: "success", class: { eyebrow: "text-success-quiet" } },
    { energy: "0", intent: "warning", class: { eyebrow: "text-warning-quiet" } },
    { energy: "0", intent: "danger", class: { eyebrow: "text-danger-quiet" } },
    { energy: ["2", "1"], size: "sm", class: { base: "p-6" } },
    { energy: ["2", "1"], size: "md", class: { base: "p-12" } },
    { energy: ["2", "1"], size: "lg", class: { base: "p-16" } },
    { pulse: true, intent: "neutral", class: { circle: "text-neutral-strong" } },
    { pulse: true, intent: "info", class: { circle: "text-info-strong" } },
    { pulse: true, intent: "success", class: { circle: "text-success-strong" } },
    { pulse: true, intent: "warning", class: { circle: "text-warning-strong" } },
    { pulse: true, intent: "danger", class: { circle: "text-danger-strong" } },
  ],
  defaultVariants: { actionsLayout: "inline" },
});

const circleSizes = { sm: "md", md: "lg", lg: "xl" } as const;

const glyphs = {
  neutral: "help",
  info: "info",
  success: "check",
  warning: "warning",
  danger: "cross",
} satisfies Record<string, IconGlyph>;
</script>

<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";
import { type Energy, resolveEnergy } from "../../utils/energy.ts";
import { setEnergyScope } from "../../utils/energy-scope.ts";
import Icon from "../icon/icon.svelte";
import IconCircle from "../icon-circle/icon-circle.svelte";

type Props =
  & HTMLAttributes<HTMLDivElement>
  & Omit<VariantProps<typeof status>, "energy">
  & {
    energy?: Energy<(typeof energyRange)[number]>;
    title: string;
    body?: string;
    eyebrow?: string;
    /** Replaces the intent glyph, e.g. a Spinner while loading. */
    icon?: Snippet;
    /** The main action matches the Status's level; write a second one `energy="0" intent="neutral"`. */
    actions?: Snippet;
  };

let {
  intent = "neutral",
  energy,
  size = "md",
  pulse,
  actionsLayout,
  title,
  body,
  eyebrow,
  icon,
  actions,
  class: className,
  ...rest
}: Props = $props();

const level = $derived(resolveEnergy(energy, energyRange));
const styles = $derived(
  status({ intent, energy: level, size, pulse, actionsLayout }),
);

setEnergyScope(() => ({ level, fill: level === "2" ? intent : undefined }));
</script>

<div class={cn(styles.base(), className)} {...rest}>
  <IconCircle {intent} size={circleSizes[size]} class={styles.circle()}>
    {#if icon}
      {@render icon()}
    {:else}
      <Icon glyph={glyphs[intent]} class="size-full" />
    {/if}
  </IconCircle>
  <div class={styles.content()}>
    {#if eyebrow}
      <span class={styles.eyebrow()}>{eyebrow}</span>
    {/if}
    <p class={styles.title()}>{title}</p>
    {#if body}<p class={styles.body()}>{body}</p>{/if}
  </div>
  {#if actions}
    <div class={styles.rule()}></div>
    <div class={styles.actions()}>{@render actions()}</div>
  {/if}
</div>
