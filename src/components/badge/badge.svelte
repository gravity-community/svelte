<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const badge = tv({
  slots: {
    base:
      "inline-flex items-center rounded-[2px] border py-px font-mono font-semibold whitespace-nowrap uppercase",
    dot: "shrink-0 rounded-full",
  },
  variants: {
    intent: {
      neutral: {
        base: "border-border-interactive text-muted-fg",
        dot: "bg-neutral-solid",
      },
      info: {
        base: "border-info-strong text-info-strong",
        dot: "bg-info-solid",
      },
      success: {
        base: "border-success-strong text-success-strong",
        dot: "bg-success-solid",
      },
      warning: {
        base: "border-warning-strong text-warning-strong",
        dot: "bg-warning-solid",
      },
      danger: {
        base: "border-danger-strong text-danger-strong",
        dot: "bg-danger-solid",
      },
    },
    size: {
      sm: {
        base: "gap-[5px] px-[5px] text-[10px] leading-[12px] tracking-[0.4px]",
        dot: "size-[3px]",
      },
      md: {
        base: "gap-[6px] px-[7px] text-[11px] leading-[14px] tracking-[0.44px]",
        dot: "size-[4px]",
      },
      lg: {
        base: "gap-[7px] px-[9px] text-[12px] leading-[16px] tracking-[0.48px]",
        dot: "size-[5px]",
      },
    },
  },
  defaultVariants: { intent: "neutral", size: "sm" },
});
</script>

<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";

type Props = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge> & {
  dot?: boolean;
};

let {
  intent,
  size,
  dot = false,
  class: className,
  children,
  ...rest
}: Props = $props();

const styles = $derived(badge({ intent, size }));
</script>

<span class={cn(styles.base(), className)} {...rest}>
  {#if dot}<span class={styles.dot()} aria-hidden="true"></span>{/if}
  {@render children?.()}
</span>
