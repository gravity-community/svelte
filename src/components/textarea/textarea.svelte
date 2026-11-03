<script module lang="ts">
import { tv } from "../../utils/classes.ts";

// The same state tokens as Input's shell.
const textarea = tv({
  slots: {
    // One grid cell: the textarea fills the box the caller sizes and inherits its corners, which InputGroup squares.
    base: "relative grid w-full rounded-xl",
    control:
      "block w-full min-h-0 resize-y rounded-[inherit] px-3.5 py-3 font-sans text-base font-normal focus-visible:outline-hidden placeholder:text-placeholder-fg disabled:cursor-not-allowed forced-colors:border",
    spinner: "pointer-events-none absolute top-3 right-3.5 text-muted-fg",
  },
  variants: {
    variant: {
      default: {},
      tinted: { control: "placeholder:text-muted-fg" },
    },
    state: {
      default: {},
      invalid: {},
      disabled: {},
    },
  },
  // deno-fmt-ignore
  compoundVariants: [
    { variant: "default", state: "default", class: { control: "border border-border-interactive bg-surface text-fg focus:border-border-focus focus:inset-ring focus:inset-ring-border-focus" } },
    { variant: "tinted", state: "default", class: { control: "bg-field-tinted text-fg focus:bg-surface-muted focus:inset-ring-2 focus:inset-ring-border-focus" } },
    { variant: "default", state: "invalid", class: { control: "border border-danger-solid bg-surface text-danger-strong focus:inset-ring focus:inset-ring-danger-solid" } },
    { variant: "tinted", state: "invalid", class: { control: "bg-danger-subtle text-danger-strong focus:inset-ring-2 focus:inset-ring-danger-solid" } },
    { variant: "default", state: "disabled", class: { control: "cursor-not-allowed border border-border-subtle bg-surface text-disabled-fg opacity-60" } },
    { variant: "tinted", state: "disabled", class: { control: "cursor-not-allowed bg-surface-muted text-disabled-fg opacity-60" } },
  ],
  defaultVariants: { variant: "default", state: "default" },
});
</script>

<script lang="ts">
import type { HTMLTextareaAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";
import Spinner from "../spinner/spinner.svelte";

type Props =
  & HTMLTextareaAttributes
  & Pick<VariantProps<typeof textarea>, "variant">
  & {
    invalid?: boolean;
    /** Corner spinner for async work; typing stays live. */
    loading?: boolean;
  };

let {
  variant,
  invalid = false,
  loading = false,
  disabled,
  rows = 4,
  value = $bindable(),
  class: className,
  ...rest
}: Props = $props();

const styles = $derived(
  textarea({
    variant,
    state: disabled ? "disabled" : invalid ? "invalid" : "default",
  }),
);
</script>

<!-- The wrapper stays put when loading toggles, so the textarea keeps focus and caret. -->
<div class={cn(styles.base(), className)}>
  <textarea
    class={styles.control()}
    bind:value
    {rows}
    {disabled}
    aria-invalid={invalid || undefined}
    {...rest}
  ></textarea>
  {#if loading}
    <Spinner class={styles.spinner()} />
  {/if}
</div>
