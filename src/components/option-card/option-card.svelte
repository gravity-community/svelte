<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const optionCard = tv({
  slots: {
    base:
      "flex w-full items-center gap-4 rounded-2xl border p-4 no-underline transition-colors",
    chip: "flex size-10 shrink-0 items-center justify-center rounded-[10px]",
    title: "text-[15px] leading-tight font-semibold",
  },
  variants: {
    state: {
      idle: {
        base:
          "border-border-subtle bg-surface hover:border-border-interactive hover:bg-page-subtle",
        chip: "bg-primary-subtle text-primary-strong",
        title: "text-fg",
      },
      selected: {
        base: "border-2 border-primary-solid bg-primary-subtle",
        chip: "bg-primary-solid text-on-primary",
        title: "text-fg",
      },
      disabled: {
        base: "cursor-not-allowed border-border-subtle bg-surface-muted",
        chip: "bg-neutral-subtle text-disabled-fg",
        title: "text-subtle-fg",
      },
    },
  },
  defaultVariants: { state: "idle" },
});
</script>

<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";
import Icon from "../icon/icon.svelte";

type Props = HTMLAttributes<HTMLElement> & {
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
  selected = false,
  disabled = false,
  href,
  class: className,
  ...rest
}: Props = $props();

const link = $derived(href && !disabled ? href : undefined);
const styles = $derived(
  optionCard({
    state: disabled ? "disabled" : selected ? "selected" : "idle",
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
      <span class="text-[13px] leading-snug text-muted-fg">{description}</span>
    {/if}
  </span>
  <Icon
    glyph={disabled ? "lock" : "caret-right"}
    class="size-5 shrink-0 text-subtle-fg"
  />
</svelte:element>
