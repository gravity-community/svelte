<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const stack = tv({
  base: "flex",
  variants: {
    // lg (16) separates rows within a section, xl (24) separates sections.
    gap: {
      none: "gap-0",
      xxs: "gap-xxs",
      sm: "gap-sm",
      md: "gap-md",
      lg: "gap-lg",
      xl: "gap-xl",
      "2xl": "gap-2xl",
    },
    direction: { column: "flex-col", row: "flex-row" },
  },
  defaultVariants: { gap: "lg", direction: "column" },
});
</script>

<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";

type Props = HTMLAttributes<HTMLElement> & VariantProps<typeof stack> & {
  /** Element to render, e.g. `section`. */
  as?: string;
};

let {
  gap,
  direction,
  as = "div",
  class: className,
  children,
  ...rest
}: Props = $props();
</script>

<svelte:element
  this={as}
  class={cn(stack({ gap, direction }), className)}
  {...rest}
>
  {@render children?.()}
</svelte:element>
