<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import ChainPath from "./chain-path.svelte";

const { Story } = defineMeta({
  title: "Data display/ChainPath",
  component: ChainPath,
  parameters: {
    docs: {
      description: {
        component:
          "Spells out an ownership chain, from the owner through each holding entity to the company.",
      },
    },
  },
  args: { path: "Jane Novak → Meridian Holdings → Interzone Inc." },
});
</script>

<Story name="Playground" />

<!-- A longer chain wraps in a narrow column; the caption is the caller's own text. -->
<Story name="With caption" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-[344px] flex-col">
      <ChainPath
        path="Jane Novak → Meridian Holdings → Northwind Capital → Interzone Inc."
      />
      <p class="text-xs text-subtle-fg">Complete chain · 3 layers</p>
    </div>
  {/snippet}
</Story>
