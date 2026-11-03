<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const energyRange = ["2", "1"] as const;

// Checkbox's field box on a disc: soft is the grey well, faint the soft frame. The chosen radio lifts one level, in danger while the answer is invalid.
const radioGroup = tv({
  slots: {
    group:
      "flex w-full flex-col gap-3 data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:flex-wrap data-[orientation=horizontal]:gap-x-6",
    row: "group/row flex items-start",
    // The 16px radio sits centred on the label's 20px line.
    radio:
      "mt-0.5 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors",
    dot: "size-1.5 rounded-full forced-colors:bg-[Highlight]",
    // Padding, not the row's gap, spaces the label from the radio, so a click there chooses too.
    text: "flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5 pl-2.5",
    label: "text-sm leading-5 text-fg",
    description: "text-[13px] leading-snug text-muted-fg",
  },
  variants: {
    energy: { "2": "", "1": "" },
    state: {
      idle: "",
      checked: "",
      invalid: "",
      // Chosen, while the answer is invalid.
      refused: "",
      disabled: {
        row: "cursor-not-allowed",
        radio:
          "cursor-not-allowed border-transparent bg-plate forced-colors:border-[GrayText]",
        dot: "bg-disabled-fg forced-colors:bg-[GrayText]",
        text: "cursor-not-allowed",
        label: "text-disabled-fg forced-colors:text-[GrayText]",
        description: "text-disabled-fg forced-colors:text-[GrayText]",
      },
    },
  },
  // deno-fmt-ignore
  compoundVariants: [
    { energy: "2", state: "idle", class: { radio: "border-transparent bg-well group-hover/row:bg-well-active focus-visible:bg-well-active" } },
    { energy: "2", state: "checked", class: { radio: "border-transparent bg-primary-solid group-hover/row:bg-primary-hover", dot: "bg-on-primary" } },
    { energy: "2", state: "invalid", class: { radio: "border-transparent bg-danger-subtle group-hover/row:bg-danger-subtle-hover focus-visible:bg-danger-subtle-hover" } },
    { energy: "2", state: "refused", class: { radio: "border-transparent bg-danger-solid", dot: "bg-on-danger" } },
    { energy: "1", state: "idle", class: { radio: "border-border-field bg-transparent group-hover/row:border-border-field-hover" } },
    { energy: "1", state: "checked", class: { radio: "border-border-focus bg-primary-deep", dot: "bg-primary-strong" } },
    { energy: "1", state: "invalid", class: { radio: "border-danger-solid bg-transparent" } },
    { energy: "1", state: "refused", class: { radio: "border-danger-solid bg-danger-deep", dot: "bg-danger-strong" } },
  ],
});
</script>

<script lang="ts" generics="V extends string">
import { Label, RadioGroup as RadioGroupPrimitive } from "bits-ui";
import { type Energy, resolveEnergy } from "../../utils/energy.ts";
import Field from "../field/field.svelte";
import type { RadioGroupItem } from "./types.ts";

type Props =
  & Omit<
    RadioGroupPrimitive.RootProps,
    "children" | "child" | "value" | "onValueChange"
  >
  & {
    /** The question, which also names the group. */
    label: string;
    hint?: string;
    /** Shown under the radios; it also marks the group invalid unless `invalid` says otherwise. */
    error?: string;
    /** Marks every radio while none is chosen, or the chosen radio refused; defaults to whether `error` is set. */
    invalid?: boolean;
    items: readonly RadioGroupItem<V>[];
    /** The chosen radio's value; "" while none is chosen. */
    value?: NoInfer<V> | "";
    onValueChange?: (value: NoInfer<V>) => void;
    energy?: Energy<(typeof energyRange)[number]>;
  };

let {
  label,
  hint,
  error,
  invalid,
  items,
  value = $bindable(""),
  onValueChange,
  energy,
  disabled,
  ref = $bindable(null),
  class: className,
  ...rest
}: Props = $props();

const uid = $props.id();
const isInvalid = $derived(invalid ?? Boolean(error));
const chosen = $derived(items.find((item) => item.value === value));
const describedBy = $derived(
  [hint && `${uid}-hint`, error && `${uid}-error`].filter(Boolean).join(" ") ||
    undefined,
);
const level = $derived(resolveEnergy(energy, energyRange));
const styles = $derived(radioGroup({ energy: level }));

function stateOf(item: RadioGroupItem<V>) {
  if (disabled || item.disabled) return "disabled";
  if (item === chosen) return isInvalid ? "refused" : "checked";
  return isInvalid && !chosen ? "invalid" : "idle";
}

function choose(next: string) {
  const item = items.find((i) => i.value === next);
  // bits-ui's Item click checks only its own `disabled`, not the group's.
  if (disabled || !item || item.disabled) return;
  value = item.value;
  onValueChange?.(item.value);
}
</script>

<Field {label} {hint} {error} idPrefix={uid} class={className}>
  <RadioGroupPrimitive.Root
    bind:ref
    bind:value={() => chosen?.value ?? "", choose}
    {disabled}
    aria-labelledby="{uid}-label"
    aria-describedby={describedBy}
    aria-invalid={isInvalid ? "true" : undefined}
    class={styles.group()}
    {...rest}
  >
    {#each items as item, i (item.value)}
      {@const state = stateOf(item)}
      <div class={styles.row({ state })}>
        <!-- bits-ui's tab stop stays on a radio that loses the choice, so a disabled radio leaves the tab order only while another radio holds it. -->
        <RadioGroupPrimitive.Item
          id="{uid}-{i}"
          value={item.value}
          disabled={item.disabled && !!chosen && item !== chosen}
          aria-disabled={item.disabled || undefined}
          aria-labelledby="{uid}-{i}-label"
          aria-describedby={item.description
          ? `${uid}-${i}-description`
          : undefined}
          class={styles.radio({ state })}
        >
          {#snippet children({ checked })}
            {#if checked}<span class={styles.dot({ state })}></span>{/if}
          {/snippet}
        </RadioGroupPrimitive.Item>
        <Label.Root for="{uid}-{i}" class={styles.text({ state })}>
          <span id="{uid}-{i}-label" class={styles.label({ state })}>
            {item.label}
          </span>
          {#if item.description}
            <span
              id="{uid}-{i}-description"
              class={styles.description({ state })}
            >
              {item.description}
            </span>
          {/if}
        </Label.Root>
      </div>
    {/each}
  </RadioGroupPrimitive.Root>
</Field>
