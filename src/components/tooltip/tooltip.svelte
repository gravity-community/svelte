<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const tooltip = tv({
  slots: {
    content:
      "z-50 flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-raised px-2 py-1 text-xs leading-4 text-fg outline-none transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
    shortcut: "font-[inherit] text-subtle-fg",
  },
});
</script>

<script lang="ts">
import { Tooltip } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "../../utils/classes.ts";

type Props = Omit<Tooltip.ContentProps, "child" | "children"> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The element it describes: spread `props` onto it, as with bits-ui's `child`. */
  trigger: Snippet<[{ props: Record<string, unknown> }]>;
  label: string;
  /** Shown after the label, e.g. ⌘Z. */
  shortcut?: string;
  /** Milliseconds of hover before it opens; focus opens it at once. */
  delayDuration?: number;
};

let {
  open = $bindable(false),
  onOpenChange,
  trigger,
  label,
  shortcut,
  delayDuration = 300,
  side = "top",
  sideOffset = 6,
  ref = $bindable(null),
  class: className,
  ...rest
}: Props = $props();

const styles = tooltip();
</script>

<Tooltip.Provider {delayDuration}>
  <Tooltip.Root bind:open {onOpenChange}>
    <Tooltip.Trigger>
      {#snippet child({ props })}
        {@render trigger({ props })}
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <!-- bits-ui wires aria-describedby on the trigger but leaves the role to the content. -->
      <Tooltip.Content
        bind:ref
        {side}
        {sideOffset}
        role="tooltip"
        class={cn(styles.content(), className)}
        {...rest}
      >
        <span>{label}</span>
        {#if shortcut}
          <kbd class={styles.shortcut()}>{shortcut}</kbd>
        {/if}
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
