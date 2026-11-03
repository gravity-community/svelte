<script module lang="ts">
import { tv } from "../../utils/classes.ts";

// Each text-<role> sets size, line height and weight from the theme.
const text = tv({
  base: "text-fg",
  variants: {
    type: {
      display: "pt-8 pb-4 font-display text-display",
      title: "pt-6 pb-3 font-sans text-title",
      heading: "pt-5 pb-2 font-sans text-heading",
      subheading: "pt-4 pb-2 font-sans text-subheading",
      label: "pt-3 pb-1 font-sans text-label",
      overline: "pt-2 pb-1 font-sans text-overline",
    },
  },
});

const elements = {
  display: "h1",
  title: "h2",
  heading: "h3",
  subheading: "h4",
  label: "h5",
  overline: "h6",
} as const;
</script>

<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";

type Props = HTMLAttributes<HTMLElement> & VariantProps<typeof text> & {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
};

let {
  type = "label",
  as,
  class: className,
  children,
  ...rest
}: Props = $props();
</script>

<svelte:element
  this={as ?? elements[type]}
  class={cn(text({ type }), className)}
  {...rest}
>
  {@render children?.()}
</svelte:element>
