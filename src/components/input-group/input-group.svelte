<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";

type Props = HTMLAttributes<HTMLDivElement>;

let { class: className, children, ...rest }: Props = $props();
</script>

<!-- Squares the inner corners so a control and its action read as one field; give the control class="flex-1". -->
<div
  class={cn(
    "flex w-full items-stretch [&>*:not(:first-child)]:rounded-s-none [&>*:not(:last-child)]:rounded-e-none",
    className,
  )}
  {...rest}
>
  {@render children?.()}
</div>
