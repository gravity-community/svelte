<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy } from "../../utils/energy.ts";
import Choice from "./choice.svelte";
import { CHOICE_SIZES, type ChoiceItem } from "./types.ts";

const energies = ["2", "1"] as const;
const states = [
  "idle",
  "checked",
  "invalid",
  "refused",
  "disabled",
  "disabled checked",
] as const;
const selection = ["idle", "checked"] as const;
const label = "Does anyone hold more than 25% of it, or control it?";
const items = [
  {
    value: "shares",
    title: "Yes, through shares",
    description: "Someone holds more than 25%, or controls it through votes.",
  },
  {
    value: "management",
    title: "No, but its management decides",
    description: "Someone on its statutory body has decisive influence.",
  },
  {
    value: "no-one",
    title: "No one does",
    description: "Its senior managers then stand in as beneficial owners.",
  },
] satisfies ChoiceItem[];
const [card] = items;
const stateProps = {
  idle: { items: [card] },
  checked: { items: [card], value: card.value },
  invalid: { items: [card], error: "Choose an answer." },
  refused: {
    items: [card],
    value: card.value,
    error: "These shares are already recorded.",
  },
  disabled: { items: [{ ...card, disabled: true }] },
  "disabled checked": {
    items: [{ ...card, disabled: true }],
    value: card.value,
  },
};

const { Story } = defineMeta({
  title: "Inputs/Choice",
  component: Choice,
  parameters: {
    docs: {
      description: {
        component:
          "A single-choice question shown as radio cards: one card per answer, with a radio, a title and an optional description.",
      },
    },
  },
  args: {
    label,
    hint: "Count shares and votes held directly or through other companies.",
    items,
    energy: "2",
    size: "md",
  },
  argTypes: {
    energy: { control: "inline-radio", options: energies },
    size: { control: "inline-radio", options: CHOICE_SIZES },
    value: { control: false },
  },
});
</script>

<script lang="ts">
let answer = $state("");
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Choice {...args} bind:value={answer} class="w-[400px]" />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies}>
      {#snippet cell(energy)}
        <Choice {label} {items} {energy} value="shares" class="w-80" />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Sizes" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={CHOICE_SIZES} columns={energies}>
      {#snippet cell(size, energy)}
        <Choice {label} {items} {energy} {size} value="shares" class="w-80" />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Soft changes only the fill; faint draws edges. An error marks every card while none is chosen, then only the chosen one, refused. -->
<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states} columns={energies}>
      {#snippet cell(state, energy)}
        <Choice {label} {...stateProps[state]} {energy} class="w-80" />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- The default soft Choice one well down shows faint, passed by hand: its edge glazes, and a checked card glazes its tint and takes the well's focus ring. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Well>
      <Matrix rows={states}>
        {#snippet cell(state)}
          <Choice
            {label}
            {...stateProps[state]}
            energy={resolveEnergy(undefined, energies, 1)}
            class="w-80"
          />
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>

<!-- The radio matches the card's level, and lifts one level while the card is checked. -->
<Story name="Parts" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies} columns={selection}>
      {#snippet cell(energy, state)}
        <Choice {label} {...stateProps[state]} {energy} class="w-80" />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
