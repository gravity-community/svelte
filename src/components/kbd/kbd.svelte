<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";

type Props = HTMLAttributes<HTMLElement>;

let { class: className, children, ...rest }: Props = $props();
</script>

<kbd
  class={cn(
    "inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] border border-border bg-surface px-1 font-mono text-xs leading-none whitespace-nowrap text-muted-fg",
    className,
  )}
  {...rest}
>
  {@render children?.()}
</kbd>
