<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const button = tv({
  slots: {
    base:
      "inline-flex shrink-0 cursor-pointer items-center justify-center font-sans font-medium whitespace-nowrap no-underline transition-interactive select-none forced-colors:border",
    icon: "flex shrink-0 items-center justify-center",
  },
  variants: {
    energy: {
      "3": "active:brightness-90",
      "2": "active:brightness-95",
      "1": "bg-plate held:forced-colors:border-[Highlight]",
      "0": "bg-transparent held:forced-colors:border-[Highlight]",
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
    // Soft on a fill of its own intent, which the energy scope reports.
    onFill: { true: "" },
    // After size, so tailwind-merge drops the size's corner radius.
    shape: { rounded: "", pill: "rounded-full" },
    iconOnly: { true: "rounded-full p-0" },
    // Loading keeps the enabled look; only a real disable dims (a link through aria-disabled).
    loading: {
      true: "pointer-events-none",
      false:
        "disabled:pointer-events-none disabled:text-disabled-fg aria-disabled:pointer-events-none aria-disabled:text-disabled-fg aria-disabled:forced-colors:border-[GrayText] aria-disabled:forced-colors:text-[GrayText]",
    },
  },
  // Held outranks hover and active, so a held faint or ghost restates both.
  // deno-fmt-ignore
  compoundVariants: [
    { energy: "3", intent: "primary", class: "bg-primary-solid text-on-primary hover:bg-primary-hover active:bg-primary-hover" },
    { energy: "3", intent: "success", class: "bg-success-solid text-on-success hover:bg-success-hover active:bg-success-hover" },
    { energy: "3", intent: "warning", class: "bg-warning-solid text-on-warning hover:bg-warning-hover active:bg-warning-hover" },
    { energy: "3", intent: "danger", class: "bg-danger-solid text-on-danger hover:bg-danger-hover active:bg-danger-hover" },
    { energy: "3", intent: "neutral", class: "bg-neutral-solid text-on-neutral hover:bg-neutral-hover active:bg-neutral-hover" },
    { energy: "3", intent: "accent", class: "bg-accent-solid text-on-accent hover:bg-accent-hover active:bg-accent-hover" },
    { energy: "2", intent: "primary", class: "bg-primary-subtle text-primary-strong hover:bg-primary-muted active:bg-primary-muted" },
    { energy: "2", intent: "success", class: "bg-success-subtle text-success-strong hover:bg-success-muted active:bg-success-muted" },
    { energy: "2", intent: "warning", class: "bg-warning-subtle text-warning-strong hover:bg-warning-muted active:bg-warning-muted" },
    { energy: "2", intent: "danger", class: "bg-danger-subtle text-danger-strong hover:bg-danger-muted active:bg-danger-muted" },
    { energy: "2", intent: "neutral", class: "bg-neutral-subtle text-neutral-strong hover:bg-neutral-muted active:bg-neutral-muted" },
    { energy: "2", intent: "accent", class: "bg-accent-subtle text-accent-strong hover:bg-accent-muted active:bg-accent-muted" },
    { energy: "2", onFill: true, intent: "primary", class: "bg-primary-deep/75 hover:bg-primary-deep active:bg-primary-deep" },
    { energy: "2", onFill: true, intent: "success", class: "bg-success-deep/75 hover:bg-success-deep active:bg-success-deep" },
    { energy: "2", onFill: true, intent: "warning", class: "bg-warning-deep/75 hover:bg-warning-deep active:bg-warning-deep" },
    { energy: "2", onFill: true, intent: "danger", class: "bg-danger-deep/75 hover:bg-danger-deep active:bg-danger-deep" },
    { energy: "2", onFill: true, intent: "neutral", class: "bg-neutral-deep/75 hover:bg-neutral-deep active:bg-neutral-deep" },
    { energy: "1", intent: "primary", class: "text-primary-strong hover:bg-primary-subtle active:bg-primary-muted held:bg-primary-subtle held:hover:bg-primary-muted held:active:bg-primary-muted" },
    { energy: "1", intent: "success", class: "text-success-strong hover:bg-success-subtle active:bg-success-muted held:bg-success-subtle held:hover:bg-success-muted held:active:bg-success-muted" },
    { energy: "1", intent: "warning", class: "text-warning-strong hover:bg-warning-subtle active:bg-warning-muted held:bg-warning-subtle held:hover:bg-warning-muted held:active:bg-warning-muted" },
    { energy: "1", intent: "danger", class: "text-danger-strong hover:bg-danger-subtle active:bg-danger-muted held:bg-danger-subtle held:hover:bg-danger-muted held:active:bg-danger-muted" },
    { energy: "1", intent: "neutral", class: "text-neutral-strong hover:bg-neutral-subtle active:bg-neutral-muted held:bg-neutral-subtle held:hover:bg-neutral-muted held:active:bg-neutral-muted" },
    { energy: "1", intent: "accent", class: "text-accent-strong hover:bg-accent-subtle active:bg-accent-muted held:bg-accent-subtle held:hover:bg-accent-muted held:active:bg-accent-muted" },
    { energy: "0", intent: "primary", class: "text-primary-strong hover:bg-primary-subtle active:bg-primary-muted held:bg-primary-subtle held:hover:bg-primary-muted held:active:bg-primary-muted" },
    { energy: "0", intent: "success", class: "text-success-strong hover:bg-success-subtle active:bg-success-muted held:bg-success-subtle held:hover:bg-success-muted held:active:bg-success-muted" },
    { energy: "0", intent: "warning", class: "text-warning-strong hover:bg-warning-subtle active:bg-warning-muted held:bg-warning-subtle held:hover:bg-warning-muted held:active:bg-warning-muted" },
    { energy: "0", intent: "danger", class: "text-danger-strong hover:bg-danger-subtle active:bg-danger-muted held:bg-danger-subtle held:hover:bg-danger-muted held:active:bg-danger-muted" },
    { energy: "0", intent: "neutral", class: "text-neutral-strong hover:bg-neutral-subtle active:bg-neutral-muted held:bg-neutral-subtle held:hover:bg-neutral-muted held:active:bg-neutral-muted" },
    { energy: "0", intent: "accent", class: "text-accent-strong hover:bg-accent-subtle active:bg-accent-muted held:bg-accent-subtle held:hover:bg-accent-muted held:active:bg-accent-muted" },
    // A disabled ghost keeps only the disabled ink; the other levels show the grey box.
    { energy: ["3", "2", "1"], loading: false, class: "disabled:bg-surface-muted aria-disabled:bg-surface-muted" },
    { iconOnly: true, size: "sm", class: "size-9" },
    { iconOnly: true, size: "md", class: "size-12" },
    { iconOnly: true, size: "lg", class: "size-14" },
  ],
  defaultVariants: { size: "md", shape: "rounded" },
});
</script>

<script lang="ts">
import type { Snippet } from "svelte";
import { Button as ButtonPrimitive } from "bits-ui";
import { cn, type VariantProps } from "../../utils/classes.ts";
import { ENERGY, type Energy, resolveEnergy } from "../../utils/energy.ts";
import { getEnergyScope } from "../../utils/energy-scope.ts";
import Spinner from "../spinner/spinner.svelte";
import {
  gravity,
  gravityParam,
} from "../../attachments/gravity/gravity.svelte.ts";
import type { GravityOptions } from "../../attachments/gravity/types.ts";

type Props =
  & ButtonPrimitive.RootProps
  & Pick<VariantProps<typeof button>, "intent" | "size" | "shape">
  & {
    energy?: Energy;
    loading?: boolean;
    leadingIcon?: Snippet;
    trailingIcon?: Snippet;
    /** On by default; `false` opts out. */
    gravity?: boolean | GravityOptions;
  };

let {
  energy,
  intent = "primary",
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
const scope = getEnergyScope();
const level = $derived(resolveEnergy(energy ?? scope()?.level, ENERGY));
const onFill = $derived(level === "2" && scope()?.fill === intent);
const styles = $derived(
  button({ energy: level, intent, size, shape, iconOnly, loading, onFill }),
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
