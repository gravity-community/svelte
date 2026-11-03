<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const link = tv({
  // Underlined at rest, so a link reads as one inside text; hover thickens it.
  base:
    "inline-flex cursor-pointer items-center py-0.5 font-medium whitespace-nowrap underline decoration-1 underline-offset-2 hover:decoration-2",
  variants: {
    // accent is for calls to action; neutral is the monochrome affordance ("Clear selection ×").
    intent: {
      accent: "text-link-fg hover:text-link-hover-fg",
      neutral: "text-fg",
      danger: "text-danger-strong",
    },
    size: { sm: "text-xs leading-4", md: "text-sm leading-5" },
  },
  defaultVariants: { intent: "accent", size: "sm" },
});
</script>

<script lang="ts">
import type {
  HTMLAnchorAttributes,
  HTMLButtonAttributes,
} from "svelte/elements";
import { Button as ButtonPrimitive } from "bits-ui";
import { cn, type VariantProps } from "../../utils/classes.ts";

type Props =
  & Omit<HTMLAnchorAttributes & HTMLButtonAttributes, "disabled">
  & VariantProps<typeof link>
  & { ref?: HTMLElement | null };

let {
  href,
  type = "button",
  intent,
  size,
  ref = $bindable(null),
  class: className,
  ...rest
}: Props = $props();

// bits-ui leaves `type` unset, and a typeless <button> submits its form.
const element = $derived<ButtonPrimitive.RootProps>(
  href ? { href, ...rest } : { type, ...rest },
);
</script>

<ButtonPrimitive.Root
  bind:ref
  class={cn(link({ intent, size }), className)}
  {...element}
/>
