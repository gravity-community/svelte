<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Icon from "../icon/icon.svelte";
import InfoCard from "./info-card.svelte";

const { Story } = defineMeta({
  title: "Data display/InfoCard",
  component: InfoCard,
  parameters: {
    docs: {
      description: {
        component:
          "A bordered card that names a collection and its size, with an optional icon chip.",
      },
    },
  },
  args: { title: "Structures", meta: "5 records" },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <InfoCard {...args} class="w-60">
      {#snippet icon()}
        <Icon glyph="layout-force" class="size-full" />
      {/snippet}
    </InfoCard>
  {/snippet}
</Story>

<Story name="Without icon" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <InfoCard title="Structures" meta="5 records" class="w-60" />
  {/snippet}
</Story>
