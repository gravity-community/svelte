<script module lang="ts">
import { tv } from "../../utils/classes.ts";
import type { IconGlyph } from "../icon/glyphs.ts";

// Type is size-invariant: size scales the ring, the gaps and the actions.
const status = tv({
  slots: {
    base: "flex flex-col items-center text-center",
    ring:
      "flex shrink-0 items-center justify-center rounded-full border bg-surface",
    glyph: "flex items-center justify-center",
    content: "flex flex-col items-center",
    title: "font-sans text-xl leading-tight font-semibold text-fg",
    body: "font-sans text-[13px] text-muted-fg",
    rule: "h-px shrink-0 bg-border-hairline",
    actions: "flex",
  },
  variants: {
    // Ring and glyph share the strong ink: solid fills fall below 3:1 contrast for graphics.
    intent: {
      neutral: { ring: "border-neutral-strong text-neutral-strong" },
      info: { ring: "border-info-strong text-info-strong" },
      success: { ring: "border-success-strong text-success-strong" },
      warning: { ring: "border-warning-strong text-warning-strong" },
      danger: { ring: "border-danger-strong text-danger-strong" },
    },
    size: {
      sm: {
        base: "gap-3",
        ring: "size-10 border-[1.25px]",
        glyph: "size-5",
        content: "gap-1",
        body: "max-w-[280px]",
        rule: "w-12",
        actions: "gap-2",
      },
      md: {
        base: "gap-4",
        ring: "size-16 border-[1.5px]",
        glyph: "size-7",
        content: "gap-2",
        body: "max-w-[460px]",
        rule: "w-16",
        actions: "gap-3",
      },
      lg: {
        base: "gap-5",
        ring: "size-20 border-[1.5px]",
        glyph: "size-9",
        content: "gap-2",
        body: "max-w-[520px]",
        rule: "w-[72px]",
        actions: "gap-3",
      },
    },
    variant: {
      plain: "",
      card: { base: "rounded-2xl bg-page-subtle" },
    },
    pulse: { true: { ring: "animate-pulse" } },
    actionsLayout: {
      inline: { actions: "items-center justify-center" },
      stretch: { actions: "w-full flex-col" },
    },
  },
  compoundVariants: [
    { variant: "card", size: "sm", class: { base: "p-6" } },
    { variant: "card", size: "md", class: { base: "p-12" } },
    { variant: "card", size: "lg", class: { base: "p-16" } },
  ],
  defaultVariants: { size: "md", variant: "plain", actionsLayout: "inline" },
});

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
import Icon from "../icon/icon.svelte";

type Props = HTMLAttributes<HTMLDivElement> & VariantProps<typeof status> & {
  title: string;
  body?: string;
  eyebrow?: string;
  /** Replaces the intent glyph, e.g. a Spinner while loading. */
  icon?: Snippet;
  actions?: Snippet;
};

let {
  intent = "neutral",
  size,
  variant,
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

const styles = $derived(
  status({ intent, size, variant, pulse, actionsLayout }),
);
</script>

<div class={cn(styles.base(), className)} {...rest}>
  <div class={styles.ring()}>
    <span class={styles.glyph()}>
      {#if icon}
        {@render icon()}
      {:else}
        <Icon glyph={glyphs[intent]} class="size-full" />
      {/if}
    </span>
  </div>
  <div class={styles.content()}>
    {#if eyebrow}
      <span class="font-mono text-[11px] tracking-[0.08em] text-subtle-fg">
        {eyebrow}
      </span>
    {/if}
    <p class={styles.title()}>{title}</p>
    {#if body}<p class={styles.body()}>{body}</p>{/if}
  </div>
  {#if actions}
    <div class={styles.rule()}></div>
    <div class={styles.actions()}>{@render actions()}</div>
  {/if}
</div>
