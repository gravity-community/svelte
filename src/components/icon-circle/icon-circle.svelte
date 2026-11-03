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
    intent: {
      neutral: { base: "bg-neutral-subtle text-fg" },
      info: { base: "bg-info-subtle text-info-strong" },
      success: { base: "bg-success-subtle text-success-strong" },
      warning: { base: "bg-warning-subtle text-warning-strong" },
      danger: { base: "bg-danger-subtle text-danger-strong" },
    } satisfies Record<IconCircleIntent, { base: string }>,
    size: {
      sm: { base: "size-7", glyph: "size-3.5", text: "text-xs" },
      md: { base: "size-10", glyph: "size-5", text: "text-sm" },
    },
  },
  defaultVariants: { intent: "neutral", size: "md" },
});
</script>

<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";

type Props =
  & HTMLAttributes<HTMLSpanElement>
  & VariantProps<typeof iconCircle>
  & {
    /** A currentColor glyph; the circle sizes it. */
    children?: Snippet;
    /** One to three characters, such as a count ("3", "99+"), shown instead of children; the circle is aria-hidden, so state the meaning in text nearby. */
    text?: string;
  };

let { intent, size, text, class: className, children, ...rest }: Props =
  $props();

const styles = $derived(iconCircle({ intent, size }));
</script>

<span class={cn(styles.base(), className)} aria-hidden="true" {...rest}>
  {#if text}
    <span class={styles.text()}>{text}</span>
  {:else}
    <span class={styles.glyph()}>{@render children?.()}</span>
  {/if}
</span>
