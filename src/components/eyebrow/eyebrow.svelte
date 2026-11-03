<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const eyebrow = tv({
  base: "text-[11px] font-semibold tracking-wide uppercase",
  variants: {
    intent: {
      neutral: "text-subtle-fg",
      primary: "text-primary-strong",
      info: "text-info-strong",
      success: "text-success-strong",
      warning: "text-warning-strong",
      danger: "text-danger-strong",
    },
    hasMeta: { true: "flex items-center justify-between gap-4" },
  },
  defaultVariants: { intent: "neutral" },
});
</script>

<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";

type Props =
  & HTMLAttributes<HTMLParagraphElement>
  & Pick<VariantProps<typeof eyebrow>, "intent">
  & {
    /** Trailing content; stays muted whatever the intent. */
    meta?: Snippet;
  };

let { intent, meta, class: className, children, ...rest }: Props = $props();
</script>

<p class={cn(eyebrow({ intent, hasMeta: !!meta }), className)} {...rest}>
  {#if meta}
    <span>{@render children?.()}</span>
    <span class="text-subtle-fg">{@render meta()}</span>
  {:else}
    {@render children?.()}
  {/if}
</p>
