<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy } from "../../utils/energy.ts";
import RadioGroup from "./radio-group.svelte";
import type { RadioGroupItem } from "./types.ts";

const energies = ["2", "1"] as const;
const states = [
  "idle",
  "checked",
  "invalid",
  "refused",
  "disabled",
  "disabled checked",
] as const;
const label = "Does anyone hold more than 25% of it, or control it?";
const items = [
  {
    value: "shares",
    label: "Yes, through shares",
    description: "Someone holds more than 25%, or controls it through votes.",
  },
  {
    value: "management",
    label: "No, but its management decides",
    description: "Someone on its statutory body has decisive influence.",
  },
  {
    value: "no-one",
    label: "No one does",
    description: "Its senior managers then stand in as beneficial owners.",
  },
] satisfies RadioGroupItem[];
const [radio] = items;
const stateProps = {
  idle: { items: [radio] },
  checked: { items: [radio], value: radio.value },
  invalid: { items: [radio], error: "Choose an answer." },
  refused: {
    items: [radio],
    value: radio.value,
    error: "These shares are already recorded.",
  },
  disabled: { items: [{ ...radio, disabled: true }] },
  "disabled checked": {
    items: [{ ...radio, disabled: true }],
    value: radio.value,
  },
};
const yesNo = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] satisfies RadioGroupItem[];

// bits-ui's RootProps bring `autocomplete`, which docgen lists with every one of its hundreds of tokens.
const ownProps = [
  "label",
  "hint",
  "error",
  "invalid",
  "items",
  "value",
  "onValueChange",
  "energy",
  "orientation",
  "loop",
  "disabled",
  "name",
  "required",
  "ref",
];

const { Story } = defineMeta({
  title: "Inputs/RadioGroup",
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component:
          "A single-choice question as a list of radios, each with a label and an optional description: the compact sibling of Choice.",
      },
      controls: { include: ownProps },
    },
    controls: { include: ownProps },
  },
  args: {
    label,
    hint: "Count shares and votes held directly or through other companies.",
    items,
    energy: "2",
  },
  argTypes: {
    energy: { control: "inline-radio", options: energies },
    value: { control: false },
  },
});
</script>

<script lang="ts">
let answer = $state("");
</script>

<Story name="Playground">
  {#snippet template(args)}
    <RadioGroup {...args} bind:value={answer} class="w-[400px]" />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies}>
      {#snippet cell(energy)}
        <RadioGroup {label} {items} {energy} value="shares" class="w-80" />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Soft changes only the fill; faint draws the field frame. An error marks every radio while none is chosen, then only the chosen one, refused. -->
<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states} columns={energies}>
      {#snippet cell(state, energy)}
        <RadioGroup {label} {...stateProps[state]} {energy} class="w-80" />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- The default soft RadioGroup one well down shows faint, passed by hand: its frame and the disabled plate glaze, and a chosen radio's ring takes the well's focus ring. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Well>
      <Matrix rows={states}>
        {#snippet cell(state)}
          <RadioGroup
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

<Story name="Horizontal" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <RadioGroup
      label="Is the company listed on a regulated market?"
      items={yesNo}
      value="no"
      orientation="horizontal"
      class="w-80"
    />
  {/snippet}
</Story>
