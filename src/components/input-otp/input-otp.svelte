<script module lang="ts">
import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "bits-ui";
import type { HTMLInputAttributes } from "svelte/elements";
import { tv } from "../../utils/classes.ts";
import type { InputOtpFormat } from "./types.ts";

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

const energyRange = ["2", "1"] as const;

const inputOtp = tv({
  slots: {
    // bits-ui's input covers the cells, so they read hover off the root's named group.
    base: "group/otp relative w-full [&_input:disabled]:cursor-not-allowed",
    cells: "flex w-full items-center",
    group: "flex flex-1 gap-2",
    // Separate tiles at both levels. A border, transparent at 2, keeps the same inset, and forced colours draw it.
    cell:
      "relative flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl border font-sans text-base data-active:forced-colors:outline-2 data-active:forced-colors:-outline-offset-2 data-active:forced-colors:outline-[Highlight]",
    caret:
      "h-5 w-px motion-safe:animate-caret-blink forced-colors:bg-[CanvasText]",
    separator: "mx-2 h-0.5 w-2 shrink-0 rounded-full",
  },
  variants: {
    energy: {
      "2": { cell: "border-transparent" },
      "1": {},
    },
    state: {
      default: { caret: "bg-fg", separator: "bg-border-interactive" },
      invalid: { caret: "bg-danger-strong", separator: "bg-danger-solid" },
      disabled: {
        cells: "opacity-60",
        cell: "border-transparent bg-surface-muted text-disabled-fg",
        separator: "bg-border-subtle",
      },
    },
    full: { true: {} },
  },
  // deno-fmt-ignore
  compoundVariants: [
    { energy: "2", state: "default", class: { cell: "bg-well text-fg data-active:bg-well-active" } },
    { energy: "2", state: "invalid", class: { cell: "bg-danger-subtle text-danger-strong data-active:bg-danger-muted" } },
    { energy: "1", state: "default", class: { cell: "border-border-field bg-transparent text-fg group-hover/otp:not-data-active:border-border-field-hover data-active:border-border-focus data-active:inset-ring data-active:inset-ring-border-focus" } },
    { energy: "1", state: "invalid", class: { cell: "border-danger-solid bg-transparent text-danger-strong data-active:inset-ring data-active:inset-ring-danger-solid" } },
    // A full code shows no caret, so the tiles keep the global focus ring.
    { full: true, class: { base: "rounded-xl has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-border-focus" } },
  ],
  defaultVariants: { state: "default", full: false },
});
</script>

<script lang="ts">
import { onMount } from "svelte";
import { PinInput } from "bits-ui";
import { cn, type VariantProps } from "../../utils/classes.ts";
import { type Energy, resolveEnergy } from "../../utils/energy.ts";

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
    energy?: Energy<(typeof energyRange)[number]>;
    format: InputOtpFormat;
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
  energy,
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
const level = $derived(resolveEnergy(energy, energyRange));
const styles = $derived(
  inputOtp({
    energy: level,
    state: disabled ? "disabled" : invalid ? "invalid" : "default",
    full: value.length === spec.length,
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
