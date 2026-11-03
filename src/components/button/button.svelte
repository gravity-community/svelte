<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const button = tv({
  slots: {
    base:
      "inline-flex shrink-0 cursor-pointer items-center justify-center font-sans font-medium whitespace-nowrap no-underline transition-interactive select-none forced-colors:border",
    icon: "flex shrink-0 items-center justify-center",
  },
  variants: {
    variant: {
      solid: "active:brightness-90",
      soft: "active:brightness-95",
      outline: "border bg-transparent",
      ghost: "bg-transparent",
    },
    intent: {
      primary: "",
      success: "",
      warning: "",
      danger: "",
      neutral: "",
      accent: "",
    },
    size: {
      sm: {
        base: "h-9 gap-2 rounded-[10px] px-3 text-sm leading-none",
        icon: "size-4",
      },
      md: {
        base: "h-12 gap-2.5 rounded-xl px-5 text-base leading-none",
        icon: "size-[18px]",
      },
      lg: {
        base: "h-14 gap-3 rounded-[14px] px-6 text-[17px] leading-none",
        icon: "size-5",
      },
    },
    // After size, so tailwind-merge drops the size's corner radius.
    shape: { rounded: "", pill: "rounded-full" },
    iconOnly: { true: "rounded-full p-0" },
    // Loading keeps the enabled look; only a real disable renders flat (a link through aria-disabled).
    loading: {
      true: "pointer-events-none",
      false:
        "disabled:pointer-events-none disabled:bg-surface-muted disabled:text-disabled-fg aria-disabled:pointer-events-none aria-disabled:bg-surface-muted aria-disabled:text-disabled-fg",
    },
  },
  // deno-fmt-ignore
  compoundVariants: [
    { variant: "solid", intent: "primary", class: "bg-primary-solid text-on-primary hover:bg-primary-hover active:bg-primary-hover" },
    { variant: "solid", intent: "success", class: "bg-success-solid text-on-success hover:bg-success-hover active:bg-success-hover" },
    { variant: "solid", intent: "warning", class: "bg-warning-solid text-on-warning hover:bg-warning-hover active:bg-warning-hover" },
    { variant: "solid", intent: "danger", class: "bg-danger-solid text-on-danger hover:bg-danger-hover active:bg-danger-hover" },
    { variant: "solid", intent: "neutral", class: "bg-neutral-solid text-on-neutral hover:bg-neutral-hover active:bg-neutral-hover" },
    { variant: "solid", intent: "accent", class: "bg-accent-solid text-on-accent hover:bg-accent-hover active:bg-accent-hover" },
    { variant: "soft", intent: "primary", class: "bg-primary-subtle text-fg hover:bg-primary-muted active:bg-primary-muted" },
    { variant: "soft", intent: "success", class: "bg-success-subtle text-success-strong hover:bg-success-muted active:bg-success-muted" },
    { variant: "soft", intent: "warning", class: "bg-warning-subtle text-warning-strong hover:bg-warning-muted active:bg-warning-muted" },
    { variant: "soft", intent: "danger", class: "bg-danger-subtle text-danger-strong hover:bg-danger-muted active:bg-danger-muted" },
    { variant: "soft", intent: "neutral", class: "bg-neutral-subtle text-fg hover:bg-neutral-muted active:bg-neutral-muted" },
    { variant: "soft", intent: "accent", class: "bg-accent-subtle text-fg hover:bg-accent-muted active:bg-accent-muted" },
    { variant: "outline", intent: "primary", class: "border-primary-solid text-fg hover:bg-primary-subtle active:bg-primary-muted" },
    { variant: "outline", intent: "success", class: "border-success-solid text-success-strong hover:bg-success-subtle active:bg-success-muted" },
    { variant: "outline", intent: "warning", class: "border-warning-solid text-warning-strong hover:bg-warning-subtle active:bg-warning-muted" },
    { variant: "outline", intent: "danger", class: "border-danger-solid text-danger-strong hover:bg-danger-subtle active:bg-danger-muted" },
    { variant: "outline", intent: "neutral", class: "border-border-interactive text-fg hover:bg-neutral-subtle active:bg-neutral-muted" },
    { variant: "outline", intent: "accent", class: "border-accent-solid text-fg hover:bg-accent-subtle active:bg-accent-muted" },
    { variant: "ghost", intent: "primary", class: "text-fg hover:bg-primary-subtle active:bg-primary-muted" },
    { variant: "ghost", intent: "success", class: "text-success-strong hover:bg-success-subtle active:bg-success-muted" },
    { variant: "ghost", intent: "warning", class: "text-warning-strong hover:bg-warning-subtle active:bg-warning-muted" },
    { variant: "ghost", intent: "danger", class: "text-danger-strong hover:bg-danger-subtle active:bg-danger-muted" },
    { variant: "ghost", intent: "neutral", class: "text-fg hover:bg-neutral-subtle active:bg-neutral-muted" },
    { variant: "ghost", intent: "accent", class: "text-fg hover:bg-accent-subtle active:bg-accent-muted" },
    { variant: "outline", loading: false, class: "disabled:border-border aria-disabled:border-border" },
    { iconOnly: true, size: "sm", class: "size-9" },
    { iconOnly: true, size: "md", class: "size-12" },
    { iconOnly: true, size: "lg", class: "size-14" },
  ],
  defaultVariants: {
    variant: "solid",
    intent: "primary",
    size: "md",
    shape: "rounded",
  },
});
</script>

<script lang="ts">
import type { Snippet } from "svelte";
import { Button as ButtonPrimitive } from "bits-ui";
import { cn, type VariantProps } from "../../utils/classes.ts";
import Spinner from "../spinner/spinner.svelte";
import {
  gravity,
  gravityParam,
} from "../../attachments/gravity/gravity.svelte.ts";
import type { GravityOptions } from "../../attachments/gravity/types.ts";

type Props =
  & ButtonPrimitive.RootProps
  & Pick<VariantProps<typeof button>, "variant" | "intent" | "size" | "shape">
  & {
    loading?: boolean;
    leadingIcon?: Snippet;
    trailingIcon?: Snippet;
    /** On by default; `false` opts out. */
    gravity?: boolean | GravityOptions;
  };

let {
  variant,
  intent,
  size,
  shape,
  loading = false,
  disabled = false,
  ref = $bindable(null),
  leadingIcon,
  trailingIcon,
  gravity: gravityOption = true,
  class: className,
  children,
  ...rest
}: Props = $props();

// Icon-only buttons need an aria-label from the caller.
const iconOnly = $derived(!children && !!(leadingIcon || loading));
const styles = $derived(
  button({ variant, intent, size, shape, iconOnly, loading }),
);
</script>

<ButtonPrimitive.Root
  bind:ref
  disabled={disabled || loading}
  aria-busy={loading || undefined}
  class={cn(styles.base(), className)}
  {@attach gravity(() => gravityParam(gravityOption, !!disabled || loading))}
  {...rest}
>
  {#if loading}
    <span class={styles.icon()}><Spinner class="size-full" /></span>
  {:else if leadingIcon}
    <span class={styles.icon()}>{@render leadingIcon()}</span>
  {/if}
  {@render children?.()}
  {#if trailingIcon}
    <span class={styles.icon()}>{@render trailingIcon()}</span>
  {/if}
</ButtonPrimitive.Root>
