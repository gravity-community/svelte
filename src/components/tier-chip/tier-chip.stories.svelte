<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import TierChip from "./tier-chip.svelte";

const tiers = ["1", "2", "3"] as const;

const { Story } = defineMeta({
  title: "Data display/TierChip",
  component: TierChip,
  parameters: {
    docs: {
      description: {
        component:
          "Names one of the three access tiers, from the limited public view to the full private view.",
      },
    },
  },
  args: { tier: "1" },
  argTypes: {
    tier: { control: "inline-radio", options: tiers },
  },
});
</script>

<Story name="Playground" />

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={tiers}>
      {#snippet cell(tier)}
        <TierChip {tier} />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
