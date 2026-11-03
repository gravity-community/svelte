<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const resultOption = tv({
  slots: {
    base:
      "group flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 text-start select-none data-highlighted:bg-surface-muted data-highlighted:inset-ring-2 data-highlighted:inset-ring-border-focus data-highlighted:forced-colors:outline-2 data-highlighted:forced-colors:-outline-offset-2 data-highlighted:forced-colors:outline-[Highlight] data-disabled:pointer-events-none",
    title: "text-sm font-medium text-fg group-data-disabled:text-disabled-fg",
    meta: "text-xs text-muted-fg group-data-disabled:text-disabled-fg",
  },
});
</script>

<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";

type Props = HTMLAttributes<HTMLDivElement> & {
  title: string;
  /** Second line, e.g. identifier · city · legal form. */
  meta?: string;
};

let { title, meta, class: className, ...rest }: Props = $props();

const styles = resultOption();
</script>

<!-- Render as the `child` of a bits-ui Combobox.Item: bits-ui supplies role, ids and the data-highlighted / data-disabled state. -->
<div class={cn(styles.base(), className)} {...rest}>
  <span class={styles.title()}>{title}</span>
  {#if meta}
    <span class={styles.meta()}>{meta}</span>
  {/if}
</div>
