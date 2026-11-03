<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const tooltip = tv({
  slots: {
    content:
      "z-50 flex max-w-64 items-center gap-2 rounded-lg border border-border-subtle bg-surface-raised px-2 py-1 text-xs leading-4 text-fg outline-none transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
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
  collisionPadding = 16,
  ref = $bindable(null),
  class: className,
  ...rest
}: Props = $props();

const styles = tooltip();
// bits-ui never opens on touch, which has no hover, so a tap toggles it here, by the trigger's click;
// a trigger's own `onclick` replaces that click, so a tap on a control with an action only acts.
// While the trigger's last press was a tap, bits-ui leaves its clicks alone.
let tapped = $state(false);
// Taken at the press: bits-ui's hover tracking can close it before the click.
let tapOpens = false;

function press(event: PointerEvent) {
  tapped = event.pointerType === "touch";
  tapOpens = !open;
}

function tap() {
  if (!tapped || open === tapOpens) return;
  open = tapOpens;
  onOpenChange?.(open);
}
</script>

<Tooltip.Provider {delayDuration}>
  <Tooltip.Root bind:open {onOpenChange} disableCloseOnTriggerClick={tapped}>
    <Tooltip.Trigger
      onpointerdown={press}
      onkeydown={() => (tapped = false)}
      onclick={tap}
    >
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
        {collisionPadding}
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
