<script module lang="ts">
import { tv } from "../../utils/classes.ts";

// The same state tokens as Input's shell.
const energyRange = ["2", "1"] as const;

const textarea = tv({
  slots: {
    // One grid cell: the textarea fills the box the caller sizes and inherits its corners, which InputGroup squares.
    base: "relative grid w-full rounded-xl",
    // A border at both levels, transparent at 2, keeps the same inset, and forced colours draw it.
    control:
      "block w-full min-h-0 resize-y rounded-[inherit] border px-3.5 py-3 font-sans text-base font-normal placeholder:text-muted-fg focus-visible:outline-hidden disabled:cursor-not-allowed",
    spinner: "pointer-events-none absolute top-3 right-3.5 text-muted-fg",
  },
  variants: {
    energy: {
      "2": { control: "border-transparent" },
      "1": {},
    },
    state: {
      default: {},
      invalid: {},
      disabled: {
        control:
          "cursor-not-allowed border-transparent bg-surface-muted text-disabled-fg opacity-60",
      },
    },
  },
  // Tailwind emits focus after hover, so focus wins over it.
  // deno-fmt-ignore
  compoundVariants: [
    { energy: "2", state: "default", class: { control: "bg-well text-fg focus:bg-well-active" } },
    { energy: "2", state: "invalid", class: { control: "bg-danger-subtle text-danger-strong focus:bg-danger-muted" } },
    { energy: "1", state: "default", class: { control: "border-border-field bg-transparent text-fg hover:border-border-field-hover focus:border-border-focus focus:inset-ring focus:inset-ring-border-focus" } },
    { energy: "1", state: "invalid", class: { control: "border-danger-solid bg-transparent text-danger-strong focus:inset-ring focus:inset-ring-danger-solid" } },
  ],
  defaultVariants: { state: "default" },
});
</script>

<script lang="ts">
import type { HTMLTextareaAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";
import { type Energy, resolveEnergy } from "../../utils/energy.ts";
import Spinner from "../spinner/spinner.svelte";

type Props =
  & HTMLTextareaAttributes
  & {
    energy?: Energy<(typeof energyRange)[number]>;
    invalid?: boolean;
    /** Corner spinner for async work; typing stays live. */
    loading?: boolean;
  };

let {
  energy,
  invalid = false,
  loading = false,
  disabled,
  rows = 4,
  value = $bindable(),
  class: className,
  ...rest
}: Props = $props();

const level = $derived(resolveEnergy(energy, energyRange));
const styles = $derived(
  textarea({
    energy: level,
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
