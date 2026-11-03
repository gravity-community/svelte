<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const popover = tv({
  slots: {
    content:
      "z-50 flex flex-col rounded-2xl border border-border-subtle bg-surface-raised pt-2 text-fg outline-none transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
    header: "flex items-start gap-2 ps-4 pe-2",
    title: "min-w-0 flex-1 pt-1.5 text-sm leading-5 font-medium text-fg",
    close:
      "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-fg transition-colors hover:bg-neutral-subtle hover:text-fg",
    body: "px-4 pt-1 pb-3 text-[13px] leading-5 text-muted-fg",
    footer:
      "flex items-center justify-end gap-2 border-t border-border-subtle px-4 py-3",
  },
  variants: {
    size: {
      sm: { content: "w-64" },
      md: { content: "w-80" },
      lg: { content: "w-100" },
    },
  },
  defaultVariants: { size: "md" },
});
</script>

<script lang="ts">
import { Popover } from "bits-ui";
import { flushSync, type Snippet } from "svelte";
import { cn, type VariantProps } from "../../utils/classes.ts";
import Icon from "../icon/icon.svelte";
import type { PopoverClose } from "./types.ts";

type Props =
  & Omit<Popover.ContentProps, "child" | "children" | "title">
  & VariantProps<typeof popover>
  & {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** The element that opens it: spread `props` onto it, as with bits-ui's `child`. */
    trigger: Snippet<[{ props: Record<string, unknown> }]>;
    /** Heads the popover and brings a close button. */
    title?: string;
    /** Gets `close`, as the body does. */
    footer?: Snippet<[{ close: PopoverClose }]>;
    /** Gets `close`, to end the popover from inside, as a pick does. */
    children?: Snippet<[{ close: PopoverClose }]>;
  };

let {
  open = $bindable(false),
  onOpenChange,
  trigger,
  title,
  footer,
  size,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  onCloseAutoFocus,
  ref = $bindable(null),
  class: className,
  children,
  ...rest
}: Props = $props();

const id = $props.id();
// Read when bits-ui's focus scope ends, which returns the focus unless told not to.
let returnFocus = true;
const styles = $derived(popover({ size }));

const close: PopoverClose = (options) => {
  if (!open) return;
  returnFocus = options?.returnFocus ?? true;
  open = false;
  onOpenChange?.(false);
  // Ends the focus scope now: until the next update its trap would pull back a focus the caller moves.
  flushSync();
};
</script>

<Popover.Root bind:open {onOpenChange}>
  <Popover.Trigger id="{id}-trigger">
    {#snippet child({ props })}
      {@render trigger({ props })}
    {/snippet}
  </Popover.Trigger>
  <Popover.Portal>
    <!-- bits-ui's trigger announces a dialog but leaves the content without the role, which a name needs; the trigger names it when there's no title. -->
    <Popover.Content
      bind:ref
      {side}
      {align}
      {sideOffset}
      role="dialog"
      aria-labelledby={title ? `${id}-title` : `${id}-trigger`}
      class={cn(styles.content(), className)}
      {...rest}
      onCloseAutoFocus={(event) => {
        onCloseAutoFocus?.(event);
        if (!returnFocus) event.preventDefault();
        returnFocus = true;
      }}
    >
      {#if title}
        <div class={styles.header()}>
          <h2 id="{id}-title" class={styles.title()}>{title}</h2>
          <Popover.Close aria-label="Close" class={styles.close()}>
            <Icon glyph="cross" />
          </Popover.Close>
        </div>
      {/if}
      <div class={styles.body()}>
        {@render children?.({ close })}
      </div>
      {#if footer}
        <div class={styles.footer()}>{@render footer({ close })}</div>
      {/if}
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
