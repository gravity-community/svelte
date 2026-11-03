<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const energyRange = ["2", "1"] as const;

// The radio matches the card's level, one level higher while checked or refused; an empty one stays neutral-deep at faint, where the plate would vanish.
const choice = tv({
  slots: {
    group: "flex w-full flex-col gap-2",
    item:
      "flex w-full cursor-pointer items-start border border-transparent text-left transition-colors",
    radio:
      "flex shrink-0 items-center justify-center rounded-full transition-colors forced-colors:border",
    dot: "rounded-full forced-colors:bg-[Highlight]",
    text: "flex min-w-0 flex-1 flex-col gap-0.5",
    title: "font-semibold",
    description: "text-[13px] leading-snug text-muted-fg",
  },
  variants: {
    size: {
      // The 16px radio sits centred on the title's 20px line.
      sm: {
        item: "gap-2.5 rounded-[10px] p-3",
        radio: "mt-0.5 size-4",
        dot: "size-1.5",
        title: "text-sm leading-5",
      },
      md: {
        item: "gap-3 rounded-xl p-4",
        radio: "size-5",
        dot: "size-2",
        title: "text-[15px] leading-5",
      },
    },
    energy: {
      "2": { title: "text-fg" },
      "1": { title: "text-quiet-fg" },
    },
    state: {
      idle: "",
      checked: "",
      invalid: "",
      // Chosen, while the answer is invalid.
      refused: "",
      disabled: {
        item: "filled-well cursor-not-allowed bg-surface-muted",
        radio: "bg-neutral-subtle forced-colors:border-[GrayText]",
        dot: "bg-disabled-fg forced-colors:bg-[GrayText]",
        title: "text-disabled-fg",
        description: "text-disabled-fg",
      },
    },
  },
  // deno-fmt-ignore
  compoundVariants: [
    // Soft selects like a field: its states change only the fill.
    { energy: "2", state: "idle", class: { item: "filled-well bg-well hover:bg-well-active focus-visible:bg-well-active", radio: "bg-neutral-deep" } },
    { energy: "2", state: "checked", class: { item: "filled-well bg-primary-subtle forced-colors:border-[Highlight]", radio: "bg-primary-solid", dot: "bg-on-primary" } },
    { energy: "2", state: "invalid", class: { item: "filled-well bg-danger-subtle hover:bg-danger-subtle-hover focus-visible:bg-danger-subtle-hover", radio: "bg-danger-deep" } },
    { energy: "2", state: "refused", class: { item: "filled-well bg-danger-subtle forced-colors:border-[Highlight]", radio: "bg-danger-solid", dot: "bg-on-danger" } },
    { energy: "1", state: "idle", class: { item: "border-neutral-subtle hover:bg-well", radio: "bg-neutral-deep" } },
    { energy: "1", state: "checked", class: { item: "filled-well border-2 border-border-focus bg-primary-subtle forced-colors:border-[Highlight]", radio: "bg-primary-deep", dot: "bg-primary-strong" } },
    { energy: "1", state: "invalid", class: { item: "border-danger-solid hover:bg-danger-subtle", radio: "bg-neutral-deep" } },
    { energy: "1", state: "refused", class: { item: "filled-well border-2 border-danger-solid bg-danger-subtle forced-colors:border-[Highlight]", radio: "bg-danger-deep", dot: "bg-danger-strong" } },
    // The 2px edge takes 1px of padding, so the card keeps its size.
    { energy: "1", state: ["checked", "refused"], size: "sm", class: { item: "p-[11px]" } },
    { energy: "1", state: ["checked", "refused"], size: "md", class: { item: "p-[15px]" } },
  ],
  defaultVariants: { size: "md" },
});
</script>

<script lang="ts" generics="V extends string">
import { RadioGroup } from "bits-ui";
import type { HTMLAttributes } from "svelte/elements";
import { type Energy, resolveEnergy } from "../../utils/energy.ts";
import Field from "../field/field.svelte";
import type { ChoiceItem, ChoiceSize } from "./types.ts";

type Props = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The question, which also names the group. */
  label: string;
  hint?: string;
  /** Shown under the cards; it also marks the choice invalid unless `invalid` says otherwise. */
  error?: string;
  /** Marks every card while none is chosen, or the chosen card refused; defaults to whether `error` is set. */
  invalid?: boolean;
  items: readonly ChoiceItem<V>[];
  /** The chosen card's value; "" while none is chosen. */
  value?: V | "";
  onValueChange?: (value: V) => void;
  energy?: Energy<(typeof energyRange)[number]>;
  size?: ChoiceSize;
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
  size,
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
const styles = $derived(choice({ energy: level, size }));

function stateOf(item: ChoiceItem<V>) {
  if (item.disabled) return "disabled";
  if (item === chosen) return isInvalid ? "refused" : "checked";
  return isInvalid && !chosen ? "invalid" : "idle";
}

function choose(next: string) {
  const item = items.find((i) => i.value === next);
  if (!item || item.disabled) return;
  value = item.value;
  onValueChange?.(item.value);
}
</script>

<Field {label} {hint} {error} idPrefix={uid} class={className} {...rest}>
  <RadioGroup.Root
    bind:value={() => value, choose}
    aria-labelledby="{uid}-label"
    aria-describedby={describedBy}
    aria-invalid={isInvalid ? "true" : undefined}
    class={styles.group()}
  >
    {#each items as item, i (item.value)}
      {@const state = stateOf(item)}
      <!-- bits-ui's tab stop stays on a card that loses the choice, so a disabled card leaves the tab order only while another card holds it. -->
      <RadioGroup.Item
        value={item.value}
        disabled={item.disabled && !!chosen && item !== chosen}
        aria-disabled={item.disabled || undefined}
        aria-labelledby="{uid}-{i}"
        aria-describedby={item.description ? `${uid}-${i}-description` : undefined}
        class={styles.item({ state })}
      >
        <span class={styles.radio({ state })} aria-hidden="true">
          {#if item === chosen}
            <span class={styles.dot({ state })}></span>
          {/if}
        </span>
        <span class={styles.text()}>
          <span id="{uid}-{i}" class={styles.title({ state })}>
            {item.title}
          </span>
          {#if item.description}
            <span
              id="{uid}-{i}-description"
              class={styles.description({ state })}
            >
              {item.description}
            </span>
          {/if}
        </span>
      </RadioGroup.Item>
    {/each}
  </RadioGroup.Root>
</Field>
