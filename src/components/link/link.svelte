<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const link = tv({
  // No underline at rest; hover draws one. A disabled link takes no pointer events, so it never hovers.
  base:
    "inline-flex cursor-pointer items-center py-0.5 font-medium whitespace-nowrap decoration-1 underline-offset-2 hover:underline disabled:pointer-events-none disabled:text-disabled-fg aria-disabled:pointer-events-none aria-disabled:text-disabled-fg",
  variants: {
    // accent is for calls to action; neutral is the monochrome affordance ("Clear selection ×"); muted sits back among helper text.
    intent: {
      accent: "text-link-fg hover:text-link-hover-fg",
      neutral: "text-fg",
      muted: "text-muted-fg hover:text-fg",
      info: "text-info-strong",
      success: "text-success-strong",
      warning: "text-warning-strong",
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
  & { ref?: HTMLElement | null; disabled?: boolean };

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
