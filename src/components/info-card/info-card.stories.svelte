<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy } from "../../utils/energy.ts";
import Icon from "../icon/icon.svelte";
import { CARD_INTENTS } from "../option-card/types.ts";
import InfoCard from "./info-card.svelte";

const energies = ["2", "1"] as const;
const grounds = ["page", "well"] as const;

const { Story } = defineMeta({
  title: "Data display/InfoCard",
  component: InfoCard,
  parameters: {
    docs: {
      description: {
        component:
          "Card that names a collection and its size, with an optional icon chip.",
      },
    },
  },
  args: {
    energy: "2",
    intent: "neutral",
    title: "Structures",
    meta: "5 records",
  },
  argTypes: {
    energy: { control: "inline-radio", options: energies },
    intent: { control: "select", options: CARD_INTENTS },
  },
});
</script>

{#snippet structures()}
  <Icon glyph="layout-force" class="size-full" />
{/snippet}

<Story name="Playground">
  {#snippet template(args)}
    <InfoCard {...args} icon={structures} class="w-60" />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template(args)}
    <Matrix rows={CARD_INTENTS} columns={energies}>
      {#snippet cell(intent, energy)}
        <InfoCard {...args} {intent} {energy} icon={structures} class="w-60" />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Columns name the level each card is given; one well down both show faint, passed by hand, and the plate glazes. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template(args)}
    <Well>
      <Matrix rows={CARD_INTENTS} columns={energies}>
        {#snippet cell(intent, energy)}
          <InfoCard
            {...args}
            {intent}
            energy={resolveEnergy(energy, energies, 1)}
            icon={structures}
            class="w-60"
          />
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>

<!-- Rows name the level each card is given. The chip matches the level the card shows, so one well down it steps down with the card. -->
<Story name="Parts" parameters={{ controls: { disable: true } }}>
  {#snippet template(args)}
    <Matrix rows={energies} columns={grounds}>
      {#snippet cell(energy, ground)}
        {#if ground === "page"}
          <InfoCard
            {...args}
            intent="success"
            {energy}
            icon={structures}
            class="w-60"
          />
        {:else}
          <Well>
            <InfoCard
              {...args}
              intent="success"
              energy={resolveEnergy(energy, energies, 1)}
              icon={structures}
              class="w-60"
            />
          </Well>
        {/if}
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Without icon" parameters={{ controls: { disable: true } }}>
  {#snippet template(args)}
    <InfoCard {...args} class="w-60" />
  {/snippet}
</Story>
