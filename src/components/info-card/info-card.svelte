<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";

type Props = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: string;
  meta?: string;
  /** A 24px glyph, shown in a tinted chip above the title. */
  icon?: Snippet;
};

let { title, meta, icon, class: className, ...rest }: Props = $props();
</script>

<div
  class={cn(
    "flex flex-col items-start rounded-xl border border-border bg-surface p-5",
    className,
  )}
  {...rest}
>
  {#if icon}
    <span
      class="mb-5 flex size-10 items-center justify-center rounded-[10px] bg-primary-subtle text-primary-strong"
      aria-hidden="true"
    >
      <span class="flex size-6 items-center justify-center">{@render icon()}</span>
    </span>
  {/if}
  <span class="text-sm leading-5 font-medium text-fg">{title}</span>
  {#if meta}
    <span class="mt-1 text-[13px] leading-5 text-subtle-fg">{meta}</span>
  {/if}
</div>
