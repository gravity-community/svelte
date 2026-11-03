<script module lang="ts">
import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "bits-ui";
import type { HTMLInputAttributes } from "svelte/elements";
import { tv } from "../../utils/classes.ts";
import type { InputOtpFormat, InputOtpVariant } from "./types.ts";

type Format = {
  length: number;
  pattern: string;
  inputmode: HTMLInputAttributes["inputmode"];
  clean: (raw: string) => string;
};

const FORMATS: Record<InputOtpFormat, Format> = {
  "3-3": {
    length: 6,
    pattern: REGEXP_ONLY_DIGITS,
    inputmode: "numeric",
    clean: (raw) => raw.replace(/\D+/g, ""),
  },
  // Lowercase passes the pattern so typing isn't blocked; `clean` uppercases it.
  "4-4": {
    length: 8,
    pattern: REGEXP_ONLY_DIGITS_AND_CHARS,
    inputmode: "text",
    clean: (raw) => raw.toUpperCase().replace(/[^0-9A-Z]+/g, ""),
  },
};

const inputOtp = tv({
  slots: {
    base: "relative w-full [&_input:disabled]:cursor-not-allowed",
    cells: "flex w-full items-center",
    group: "flex flex-1",
    cell:
      "relative flex h-12 min-w-0 flex-1 items-center justify-center font-sans text-base data-active:z-10 data-active:forced-colors:outline-2 data-active:forced-colors:-outline-offset-2 data-active:forced-colors:outline-[Highlight]",
    caret:
      "h-5 w-px motion-safe:animate-caret-blink forced-colors:bg-[CanvasText]",
    separator: "mx-2 h-0.5 w-2 shrink-0 rounded-full",
  },
  variants: {
    variant: {
      // Joined cells sharing their borders; z-10 lets the active cell's ring win the seam its neighbour's -ml-px overlaps.
      default: {
        cell:
          "border bg-surface not-first:-ml-px first:rounded-s-xl last:rounded-e-xl data-active:inset-ring",
      },
      // No borders, so the cells stand apart as tiles. Forced colours drop fills, so they need the edge there.
      tinted: {
        group: "gap-2",
        cell: "rounded-xl forced-colors:border data-active:inset-ring-2",
      },
    },
    state: {
      default: { caret: "bg-fg", separator: "bg-border-interactive" },
      invalid: { caret: "bg-danger-strong", separator: "bg-danger-solid" },
      disabled: { cells: "opacity-60", separator: "bg-border-subtle" },
    },
  },
  // deno-fmt-ignore
  compoundVariants: [
    { variant: "default", state: "default", class: { cell: "border-border-interactive text-fg data-active:border-border-focus data-active:inset-ring-border-focus" } },
    { variant: "default", state: "invalid", class: { cell: "border-danger-solid text-danger-strong data-active:inset-ring-danger-solid" } },
    { variant: "default", state: "disabled", class: { cell: "border-border-subtle text-disabled-fg" } },
    { variant: "tinted", state: "default", class: { cell: "bg-field-tinted text-fg data-active:bg-surface-muted data-active:inset-ring-border-focus" } },
    { variant: "tinted", state: "invalid", class: { cell: "bg-danger-subtle text-danger-strong data-active:inset-ring-danger-solid" } },
    { variant: "tinted", state: "disabled", class: { cell: "bg-surface-muted text-disabled-fg" } },
  ],
  defaultVariants: { variant: "default", state: "default" },
});
</script>

<script lang="ts">
import { onMount } from "svelte";
import { PinInput } from "bits-ui";
import { cn } from "../../utils/classes.ts";

type Props =
  & Omit<
    PinInput.RootProps,
    | "children"
    | "maxlength"
    | "pattern"
    | "inputmode"
    | "pasteTransformer"
    | "onComplete"
    | "inputId"
    | "inputRef"
  >
  & {
    format: InputOtpFormat;
    variant?: InputOtpVariant;
    invalid?: boolean;
    /** Take focus on mount. */
    autofocus?: boolean;
    /** Submit the surrounding form once the code is complete. */
    autosubmit?: boolean;
    /** Fires once each time the code reaches full length. */
    oncomplete?: (code: string) => void;
  };

let {
  format,
  variant,
  value = $bindable(""),
  invalid = false,
  disabled = false,
  autofocus = false,
  autosubmit = false,
  oncomplete,
  id,
  ref = $bindable(null),
  class: className,
  ...rest
}: Props = $props();

let inputRef = $state<HTMLInputElement | null>(null);

const spec = $derived(FORMATS[format]);
const half = $derived(spec.length / 2);
const styles = $derived(
  inputOtp({
    variant,
    state: disabled ? "disabled" : invalid ? "invalid" : "default",
  }),
);

// Runs before bits-ui's handler, so the input and the value never disagree.
function cleanInput(event: Event & { currentTarget: HTMLInputElement }) {
  const input = event.currentTarget;
  const next = spec.clean(input.value);
  if (next !== input.value) input.value = next;
}

// A pasted code replaces the whole value; junk is blocked so bits-ui can't paste "" over the selection.
function replaceOnPaste(
  event: ClipboardEvent & { currentTarget: HTMLInputElement },
) {
  if (!spec.clean(event.clipboardData?.getData("text/plain") ?? "")) {
    event.preventDefault();
    return;
  }
  event.currentTarget.select();
}

// Not bits-ui's onComplete: it skips a full code that replaces another full code.
function commit(next: string) {
  const was = value;
  value = next;
  if (next.length < spec.length || next === was) return;
  oncomplete?.(next);
  // Queued so the keystroke that completed the code finishes first.
  if (autosubmit && !disabled) {
    queueMicrotask(() => inputRef?.form?.requestSubmit());
  }
}

onMount(() => {
  if (autofocus && !disabled) inputRef?.focus();
});
</script>

<!-- `id` lands on the input, so a label's `for` reaches it. -->
<PinInput.Root
  {...rest}
  bind:value={() => value, commit}
  bind:ref
  bind:inputRef
  inputId={id}
  maxlength={spec.length}
  pattern={spec.pattern}
  inputmode={spec.inputmode}
  pasteTransformer={spec.clean}
  autocapitalize={format === "4-4" ? "characters" : undefined}
  spellcheck="false"
  aria-invalid={invalid || undefined}
  {disabled}
  oninput={cleanInput}
  onpaste={replaceOnPaste}
  class={cn(styles.base(), className)}
>
  {#snippet children({ cells })}
    <div aria-hidden="true" class={styles.cells()}>
      {#each [cells.slice(0, half), cells.slice(half)] as group, g (g)}
        {#if g > 0}<span class={styles.separator()}></span>{/if}
        <div class={styles.group()}>
          {#each group as cell, i (i)}
            <PinInput.Cell {cell} class={styles.cell()}>
              {#if cell.char}
                {cell.char}
              {:else if cell.hasFakeCaret}
                <span class={styles.caret()}></span>
              {/if}
            </PinInput.Cell>
          {/each}
        </div>
      {/each}
    </div>
  {/snippet}
</PinInput.Root>
