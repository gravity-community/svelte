<script
  lang="ts"
  generics="Row extends string | number, Column extends string | number"
>
import type { Snippet } from "svelte";

type Props = {
  rows: readonly Row[];
  columns?: readonly Column[];
  cell: Snippet<[Row, Column]>;
};

let { rows, columns, cell }: Props = $props();

const label = "font-mono text-xs text-subtle-fg";
</script>

<!-- A labelled grid of specimens: one row per `rows` value, one column per `columns` value. -->
<div
  class="grid items-center justify-items-start gap-x-8 gap-y-4"
  style:grid-template-columns="max-content repeat({columns?.length ?? 1}, max-content)"
>
  {#if columns}
    <span></span>
    {#each columns as column (column)}
      <span class={label}>{column}</span>
    {/each}
  {/if}
  {#each rows as row (row)}
    <span class={label}>{row}</span>
    {#each columns ?? [undefined as unknown as Column] as column (column)}
      {@render cell(row, column)}
    {/each}
  {/each}
</div>
