<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";
import type { DocumentSection } from "./types.ts";

type Props = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  /** The document's name, shown above the body and naming the region. */
  title?: string;
  sections?: DocumentSection[];
};

let { title, sections = [], class: className, ...rest }: Props = $props();
</script>

<!-- Focusable: nothing inside takes focus, so keyboard readers couldn't otherwise scroll to the end. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class={cn(
    "flex h-90 flex-col gap-2.5 overflow-y-auto rounded-xl border border-border-hairline p-4 text-xs leading-[18px]",
    className,
  )}
  tabindex="0"
  role="region"
  aria-label={title}
  {...rest}
>
  {#if title}
    <p class="font-medium text-fg">{title}</p>
  {/if}
  {#each sections as section, i (i)}
    {#if section.heading}
      <p class={["font-medium text-fg", i > 0 && "mt-2"]}>{section.heading}</p>
    {/if}
    {#each section.paragraphs as paragraph, j (j)}
      <p class="text-muted-fg">{paragraph}</p>
    {/each}
  {/each}
</div>
