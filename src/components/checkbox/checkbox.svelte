<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const energyRange = ["2", "1"] as const;

// A field box: soft is the grey well, faint the soft frame. Checked lifts the box one level, as Choice's radio does, and keeps a frame at faint.
const checkbox = tv({
  base:
    "inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
  variants: {
    energy: { "2": "", "1": "" },
    state: {
      idle: "",
      checked: "",
      // The plate, not surface-muted: it stays a step off the soft box and glazes inside wells.
      disabled:
        "cursor-not-allowed border-transparent bg-plate text-disabled-fg",
    },
  },
  // deno-fmt-ignore
  compoundVariants: [
    { energy: "2", state: "idle", class: "border-transparent bg-well hover:bg-well-active focus-visible:bg-well-active" },
    { energy: "2", state: "checked", class: "border-transparent bg-primary-solid text-on-primary hover:bg-primary-hover" },
    { energy: "1", state: "idle", class: "border-border-field bg-transparent hover:border-border-field-hover" },
    { energy: "1", state: "checked", class: "border-border-focus bg-primary-deep text-primary-strong" },
  ],
});
</script>

<script lang="ts">
import { Checkbox as CheckboxPrimitive } from "bits-ui";
import { cn } from "../../utils/classes.ts";
import { type Energy, resolveEnergy } from "../../utils/energy.ts";
import Icon from "../icon/icon.svelte";

// No indeterminate look exists in the design yet.
type Props =
  & Omit<
    CheckboxPrimitive.RootProps,
    "children" | "child" | "indeterminate" | "onIndeterminateChange"
  >
  & { energy?: Energy<(typeof energyRange)[number]> };

let {
  checked = $bindable(false),
  ref = $bindable(null),
  energy,
  disabled,
  class: className,
  ...rest
}: Props = $props();

const level = $derived(resolveEnergy(energy, energyRange));
const state = $derived(disabled ? "disabled" : checked ? "checked" : "idle");
</script>

<CheckboxPrimitive.Root
  bind:checked
  bind:ref
  {disabled}
  class={cn(checkbox({ energy: level, state }), className)}
  {...rest}
>
  {#snippet children({ checked })}
    {#if checked}<Icon glyph="check" class="size-3" />{/if}
  {/snippet}
</CheckboxPrimitive.Root>
