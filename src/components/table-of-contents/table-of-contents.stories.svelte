<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import TableOfContents from "./table-of-contents.svelte";
import type { TableOfContentsItem } from "./types.ts";

const items: TableOfContentsItem[] = [
  { id: "overview", label: "Overview" },
  { id: "installation", label: "Installation" },
  { id: "configuration", label: "Configuration" },
  { id: "usage", label: "Usage" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

const { Story } = defineMeta({
  title: "Navigation/TableOfContents",
  component: TableOfContents,
  parameters: {
    docs: {
      description: {
        component:
          "In-page navigation for a long page that marks the section in view as you scroll.",
      },
    },
  },
  args: { items, activeId: "overview", title: "On this page" },
  argTypes: {
    activeId: { control: "select", options: items.map((item) => item.id) },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <TableOfContents {...args} class="w-[220px]" />
  {/snippet}
</Story>

<!-- Without activeId, a section turns active as it enters the top 30% of the viewport. -->
<Story
  name="Scroll spy"
  parameters={{ layout: "padded", controls: { disable: true } }}
>
  {#snippet template()}
    <div class="grid grid-cols-[1fr_220px] gap-12">
      <div class="flex flex-col gap-6">
        {#each items as item (item.id)}
          <section id={item.id} class="flex min-h-[240px] flex-col gap-2">
            <h2 class="text-xl font-semibold text-fg">{item.label}</h2>
            <p class="text-sm text-muted-fg">
              Scroll the page to move the marker in the list on the right.
            </p>
          </section>
        {/each}
      </div>
      <TableOfContents {items} class="sticky top-6 self-start" />
    </div>
  {/snippet}
</Story>
