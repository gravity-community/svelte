<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const collapsible = tv({
  slots: {
    root: "",
    content:
      "transition-[opacity,translate] duration-180 ease-out data-starting-style:-translate-y-1 data-starting-style:opacity-0 motion-reduce:transition-none",
  },
  variants: {
    // A caller's trigger keeps its own width, and the content the caller's look: no rule, paddings or text style.
    titled: {
      true: {
        root: "border-b border-border",
        content: "pb-4 text-[13px] leading-5 text-muted-fg",
      },
      false: { root: "flex flex-col items-start", content: "self-stretch" },
    },
  },
});
</script>

<script lang="ts">
import { Collapsible as CollapsiblePrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "../../utils/classes.ts";
import Icon from "../icon/icon.svelte";

type Props =
  & Omit<CollapsiblePrimitive.RootProps, "title" | "children" | "child">
  & { children?: Snippet }
  & (
    | { title: string; trigger?: never }
    | {
      /** Replaces the title row with an element after the content, such as a Show more button: spread `props` onto it, as with bits-ui's `child`. */
      trigger: Snippet<[{ props: Record<string, unknown> }]>;
      title?: never;
    }
  );

let {
  title,
  trigger,
  open = $bindable(false),
  ref = $bindable(null),
  class: className,
  children,
  ...rest
}: Props = $props();

const styles = $derived(collapsible({ titled: !trigger }));
</script>

<CollapsiblePrimitive.Root
  bind:open
  bind:ref
  class={cn(styles.root(), className)}
  {...rest}
>
  {#if !trigger}
    <CollapsiblePrimitive.Trigger
      class="flex w-full items-center gap-3 py-4 text-left"
    >
      <span class="min-w-0 flex-1 text-sm leading-5 font-medium text-fg">
        {title}
      </span>
      <Icon glyph={open ? "minus" : "plus"} class="shrink-0 text-subtle-fg" />
    </CollapsiblePrimitive.Trigger>
  {/if}
  <CollapsiblePrimitive.Content class={styles.content()}>
    {@render children?.()}
  </CollapsiblePrimitive.Content>
  {#if trigger}
    <CollapsiblePrimitive.Trigger>
      {#snippet child({ props })}
        {@render trigger({ props })}
      {/snippet}
    </CollapsiblePrimitive.Trigger>
  {/if}
</CollapsiblePrimitive.Root>
