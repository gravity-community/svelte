<script lang="ts">
import { Checkbox as CheckboxPrimitive } from "bits-ui";
import { cn } from "../../utils/classes.ts";
import Icon from "../icon/icon.svelte";

// No indeterminate look exists in the design yet.
type Props = Omit<
  CheckboxPrimitive.RootProps,
  "children" | "child" | "indeterminate" | "onIndeterminateChange"
>;

let {
  checked = $bindable(false),
  ref = $bindable(null),
  class: className,
  ...rest
}: Props = $props();
</script>

<CheckboxPrimitive.Root
  bind:checked
  bind:ref
  class={cn(
    "group relative inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] text-on-primary disabled:cursor-not-allowed",
    className,
  )}
  {...rest}
>
  {#snippet children({ checked })}
    <!-- Its own layer, so disabled dims the box and never the check. -->
    <span
      class="absolute inset-0 rounded-[inherit] border-[1.5px] border-border-interactive bg-surface transition-colors group-disabled:opacity-50 group-data-[state=checked]:border-transparent group-data-[state=checked]:bg-primary-solid"
    ></span>
    {#if checked}<Icon glyph="check" class="relative size-3" />{/if}
  {/snippet}
</CheckboxPrimitive.Root>
