<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";

type Props = HTMLAttributes<HTMLElement>;

let { class: className, children, ...rest }: Props = $props();
</script>

<!-- Route links, not ARIA tabs. A row too wide scrolls inside the bar rather than widening the page. -->
<nav
  class={cn(
    "flex items-end gap-6 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    className,
  )}
  {...rest}
>
  {@render children?.()}
</nav>
