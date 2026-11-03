<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const tab = tv({
  base:
    "inline-flex cursor-pointer items-center gap-1.5 px-1 pt-2.5 pb-3 font-sans text-sm leading-5 font-medium whitespace-nowrap no-underline transition-colors duration-150 select-none focus-visible:-outline-offset-2",
  variants: {
    state: {
      idle: "text-muted-fg hover:text-fg",
      active: "border-b-2 border-primary-solid text-fg",
      disabled: "pointer-events-none text-disabled-fg opacity-55",
    },
  },
  defaultVariants: { state: "idle" },
});
</script>

<script lang="ts">
import type { Snippet } from "svelte";
import type {
  HTMLAnchorAttributes,
  HTMLButtonAttributes,
} from "svelte/elements";
import { Button as ButtonPrimitive } from "bits-ui";
import { cn } from "../../utils/classes.ts";

type Props = HTMLAnchorAttributes & HTMLButtonAttributes & {
  active?: boolean;
  icon?: Snippet;
  ref?: HTMLElement | null;
};

let {
  href,
  type = "button",
  active = false,
  disabled = false,
  icon,
  ref = $bindable(null),
  class: className,
  children,
  ...rest
}: Props = $props();

// bits-ui leaves `type` unset, and a typeless <button> submits its form.
const element = $derived<ButtonPrimitive.RootProps>(
  href ? { href, ...rest } : { type, ...rest },
);
const state = $derived(disabled ? "disabled" : active ? "active" : "idle");
</script>

<ButtonPrimitive.Root
  bind:ref
  {disabled}
  aria-current={active ? "page" : undefined}
  class={cn(tab({ state }), className)}
  {...element}
>
  {#if icon}
    <span class="flex size-4 shrink-0 items-center justify-center">
      {@render icon()}
    </span>
  {/if}
  {@render children?.()}
</ButtonPrimitive.Root>
