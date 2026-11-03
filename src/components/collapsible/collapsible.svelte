<script lang="ts">
import { Collapsible as CollapsiblePrimitive } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "../../utils/classes.ts";
import Icon from "../icon/icon.svelte";

type Props =
  & Omit<CollapsiblePrimitive.RootProps, "title" | "children" | "child">
  & { title: string; children?: Snippet };

let {
  title,
  open = $bindable(false),
  ref = $bindable(null),
  class: className,
  children,
  ...rest
}: Props = $props();
</script>

<CollapsiblePrimitive.Root
  bind:open
  bind:ref
  class={cn("border-b border-border", className)}
  {...rest}
>
  <CollapsiblePrimitive.Trigger
    class="flex w-full items-center gap-3 py-4 text-left"
  >
    <span class="min-w-0 flex-1 text-sm leading-5 font-medium text-fg">
      {title}
    </span>
    <Icon glyph={open ? "minus" : "plus"} class="shrink-0 text-subtle-fg" />
  </CollapsiblePrimitive.Trigger>
  <CollapsiblePrimitive.Content
    class="pb-4 text-[13px] leading-5 text-muted-fg transition-[opacity,translate] duration-180 ease-out data-starting-style:-translate-y-1 data-starting-style:opacity-0 motion-reduce:transition-none"
  >
    {@render children?.()}
  </CollapsiblePrimitive.Content>
</CollapsiblePrimitive.Root>
