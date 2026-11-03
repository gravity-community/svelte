<script lang="ts">
import { Popover } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "../../utils/classes.ts";

type Props = Omit<Popover.TriggerProps, "children" | "child"> & {
  term: string;
  translation?: string;
  definition: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The term as it reads in the prose; defaults to `term`. */
  children?: Snippet;
};

let {
  term,
  translation,
  definition,
  open = $bindable(false),
  onOpenChange,
  ref = $bindable(null),
  class: className,
  children,
  ...rest
}: Props = $props();
</script>

<Popover.Root bind:open {onOpenChange}>
  <Popover.Trigger
    bind:ref
    openOnHover
    openDelay={100}
    closeDelay={150}
    class={cn(
      "cursor-help font-normal text-fg underline decoration-dotted underline-offset-2",
      className,
    )}
    {...rest}
  >
    {#if children}{@render children()}{:else}{term}{/if}
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Content
      side="bottom"
      align="start"
      sideOffset={10}
      class="z-50 flex w-[300px] flex-col gap-1 rounded-2xl border border-border-subtle bg-surface-raised px-3.5 py-3 outline-none transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0"
    >
      <span class="text-sm font-medium text-fg">{term}</span>
      {#if translation}
        <span class="text-[13px] text-subtle-fg italic">{translation}</span>
      {/if}
      <span class="text-[13px] text-muted-fg">{definition}</span>
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
