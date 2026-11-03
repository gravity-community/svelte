<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";

type Props = HTMLAttributes<HTMLDivElement> & {
  /** An ownership chain, e.g. "Jane Novak → Meridian Holdings → Interzone Inc."; `children` replaces it. */
  path?: string;
};

let { path, class: className, children, ...rest }: Props = $props();
</script>

<div
  class={cn("py-1 text-sm leading-5 font-medium text-fg", className)}
  {...rest}
>
  {#if children}{@render children()}{:else}{path}{/if}
</div>
