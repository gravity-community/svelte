<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy } from "../../utils/energy.ts";
import Icon from "../icon/icon.svelte";
import OptionCard from "./option-card.svelte";
import { CARD_INTENTS } from "./types.ts";

const energies = ["2", "1"] as const;
const states = ["idle", "selected", "disabled"] as const;
const selection = ["idle", "selected"] as const;
const stateProps = {
  idle: {},
  selected: { selected: true },
  disabled: { disabled: true },
};

const { Story } = defineMeta({
  title: "Navigation/OptionCard",
  component: OptionCard,
  parameters: {
    docs: {
      description: {
        component:
          "Card link to one of several options, such as a role to sign up as, that marks the current one as selected.",
      },
    },
  },
  args: {
    title: "Submitter",
    description: "Publish ownership records to the registry.",
    href: "#",
    energy: "2",
    intent: "neutral",
    selected: false,
    disabled: false,
  },
  argTypes: {
    energy: { control: "inline-radio", options: energies },
    intent: { control: "select", options: CARD_INTENTS },
  },
});
</script>

{#snippet upload()}
  <Icon glyph="upload" class="size-full" />
{/snippet}

<Story name="Playground">
  {#snippet template(args)}
    <OptionCard {...args} icon={upload} class="w-[400px]" />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template(args)}
    <Matrix rows={CARD_INTENTS} columns={energies}>
      {#snippet cell(intent, energy)}
        <OptionCard {...args} {intent} {energy} icon={upload} class="w-80" />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- A neutral card selects in primary. -->
<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template(args)}
    <Matrix rows={states} columns={energies}>
      {#snippet cell(state, energy)}
        <OptionCard
          {...args}
          {...stateProps[state]}
          {energy}
          icon={upload}
          class="w-80"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- A default soft card one well down shows faint, passed by hand: its plate or edge glazes, and a selected card glazes its tint and takes the well's focus ring. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template(args)}
    <Well>
      <Matrix rows={CARD_INTENTS} columns={selection}>
        {#snippet cell(intent, state)}
          <OptionCard
            {...args}
            {...stateProps[state]}
            {intent}
            energy={resolveEnergy(undefined, energies, 1)}
            icon={upload}
            class="w-80"
          />
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>

<!-- The chip matches the card's level, and lifts one level while the card is selected. -->
<Story name="Parts" parameters={{ controls: { disable: true } }}>
  {#snippet template(args)}
    <Matrix rows={energies} columns={selection}>
      {#snippet cell(energy, state)}
        <OptionCard
          {...args}
          {...stateProps[state]}
          intent="success"
          {energy}
          icon={upload}
          class="w-80"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
