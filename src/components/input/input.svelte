<script module lang="ts">
import { tv } from "../../utils/classes.ts";
import { inputShell } from "./shell.ts";

const input = tv({
  extend: inputShell,
  slots: {
    reveal:
      "relative flex shrink-0 items-center justify-center text-muted-fg transition-colors before:absolute before:content-[''] enabled:hover:text-fg enabled:aria-pressed:text-fg disabled:cursor-not-allowed disabled:text-disabled-fg",
    stepper:
      "flex items-center justify-center text-muted-fg transition-colors enabled:hover:text-fg disabled:cursor-not-allowed disabled:text-disabled-fg",
  },
  variants: {
    // The reveal's grown hit area reaches left only as far as the gap, so it never covers the text.
    size: {
      sm: {
        reveal:
          "size-3.5 before:-inset-y-1.5 before:-right-2.5 before:-left-0.5",
        stepper: "size-2.5",
      },
      md: {
        reveal: "size-4 before:-inset-y-1.5 before:-right-2.5 before:-left-1",
        stepper: "size-3",
      },
      lg: {
        reveal:
          "size-[18px] before:-inset-y-1.5 before:-right-2 before:-left-1.5",
        stepper: "size-3.5",
      },
    },
  },
});

// The steppers replace the native spinner.
const noSpinner =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

// Grid arithmetic is float arithmetic: (0.3 - 0) / 0.1 is 2.9999999999999996.
const GRID_TOLERANCE = 1e-9;

function finite(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

// step="any", a missing step and a non-positive one all step by 1, as the native spinner does.
function stepOf(value: unknown): number {
  const n = finite(value);
  return n !== undefined && n > 0 ? n : 1;
}

// String(1e-7) is "1e-7": the exponent adds places; toFixed takes at most 100.
function decimalsOf(n: number): number {
  const [mantissa, exponent = "0"] = String(n).split("e");
  const places = (mantissa.split(".")[1]?.length ?? 0) - Number(exponent);
  return Math.min(100, Math.max(0, places));
}
</script>

<script lang="ts">
import { Toggle } from "bits-ui";
import type { Snippet } from "svelte";
import type { HTMLInputAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";
import Icon from "../icon/icon.svelte";
import Spinner from "../spinner/spinner.svelte";
import type { InputSize, InputType, InputVariant } from "./types.ts";

type Props = Omit<HTMLInputAttributes, "size" | "type"> & {
  type?: InputType;
  variant?: InputVariant;
  size?: InputSize;
  invalid?: boolean;
  /** Trailing spinner for async work; typing stays live. */
  loading?: boolean;
  leadingIcon?: Snippet;
  trailingIcon?: Snippet;
};

let {
  type = "text",
  variant,
  size,
  invalid = false,
  loading = false,
  disabled,
  leadingIcon,
  trailingIcon,
  value = $bindable(),
  min,
  max,
  step,
  class: className,
  ...rest
}: Props = $props();

// Never a prop: a remount always lands back on hidden.
let revealed = $state(false);

const isNumber = $derived(type === "number");
const styles = $derived(
  input({
    variant,
    size,
    state: disabled ? "disabled" : invalid ? "invalid" : "default",
  }),
);
// Loading hides the toggle, so it hides the password too.
const nativeType = $derived(
  type === "password" && revealed && !loading ? "text" : type,
);

// Steps sit on a grid anchored at min (or 0), like the native element's.
const current = $derived(finite(value));
const minValue = $derived(finite(min));
const stepSize = $derived(stepOf(step));
const stepBase = $derived(minValue ?? 0);
// The last on-grid value within max: clamping to a bare max could leave the field off-grid and invalid.
const gridMax = $derived.by(() => {
  const maxValue = finite(max);
  if (maxValue === undefined) return undefined;
  return stepBase +
    Math.floor((maxValue - stepBase) / stepSize + GRID_TOLERANCE) * stepSize;
});
const atMin = $derived(
  current !== undefined && minValue !== undefined && current <= minValue,
);
const atMax = $derived(
  current !== undefined && gridMax !== undefined && current >= gridMax,
);

// Like the native spinner: empty counts as 0 and an off-grid value snaps to the next grid point.
function nudge(direction: 1 | -1) {
  const index = ((current ?? 0) - stepBase) / stepSize;
  const target = direction === 1
    ? Math.floor(index + GRID_TOLERANCE) + 1
    : Math.ceil(index - GRID_TOLERANCE) - 1;
  let next = stepBase + target * stepSize;
  if (minValue !== undefined) next = Math.max(next, minValue);
  if (gridMax !== undefined) next = Math.min(next, gridMax);
  // Rounds off float drift at the grid's precision; a number, as bind:value writes one.
  value = Number(
    next.toFixed(Math.max(decimalsOf(stepSize), decimalsOf(stepBase))),
  );
}
</script>

<div class={cn(styles.base(), className)}>
  {#if leadingIcon}
    <span class={styles.icon()}>{@render leadingIcon()}</span>
  {/if}
  <input
    type={nativeType}
    class={[styles.control(), isNumber && noSpinner]}
    bind:value
    {disabled}
    {min}
    {max}
    {step}
    aria-invalid={invalid || undefined}
    {...rest}
  />
  <!-- Trailing slot: loading > the type's own control > trailingIcon. Its buttons are type="button" since Input sits in real forms. -->
  {#if loading}
    <span class={styles.icon()}>
      <Spinner class="size-full text-muted-fg" />
    </span>
  {:else if type === "password"}
    <Toggle.Root
      bind:pressed={revealed}
      {disabled}
      aria-label={revealed ? "Hide password" : "Show password"}
      class={styles.reveal()}
    >
      <Icon glyph={revealed ? "eye-off" : "eye"} class="size-full" />
    </Toggle.Root>
  {:else if isNumber}
    <div class="flex shrink-0 flex-col">
      <button
        type="button"
        aria-label="Increase value"
        disabled={disabled || atMax}
        class={styles.stepper()}
        onclick={() => nudge(1)}
      >
        <Icon glyph="chevron-up" class="size-full" />
      </button>
      <button
        type="button"
        aria-label="Decrease value"
        disabled={disabled || atMin}
        class={styles.stepper()}
        onclick={() => nudge(-1)}
      >
        <Icon glyph="chevron-down" class="size-full" />
      </button>
    </div>
  {:else if trailingIcon}
    <span class={styles.icon()}>{@render trailingIcon()}</span>
  {/if}
</div>
