<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";

type Props = HTMLAttributes<HTMLElement>;

let { class: className, children, ...rest }: Props = $props();
</script>

<code
  class={cn(
    "inline-flex items-center rounded-lg bg-neutral-subtle px-1.5 py-0.5 font-mono text-[14px] leading-[14px] whitespace-nowrap text-fg",
    className,
  )}
  {...rest}
>
  {@render children?.()}
</code>
