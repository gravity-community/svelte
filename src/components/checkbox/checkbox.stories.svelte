<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy } from "../../utils/energy.ts";
import Checkbox from "./checkbox.svelte";

const energies = ["2", "1"] as const;
const values = ["unchecked", "checked"] as const;
const states = [...values, "disabled", "disabled checked"] as const;
const stateProps = {
  unchecked: {},
  checked: { checked: true },
  disabled: { disabled: true },
  "disabled checked": { checked: true, disabled: true },
};
const label = "Remember this device";

const { Story } = defineMeta({
  title: "Inputs/Checkbox",
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          "Turns a single option on or off, built on bits-ui Checkbox.",
      },
    },
  },
  args: { checked: false, disabled: false, energy: "2" },
  argTypes: {
    energy: { control: "inline-radio", options: energies },
  },
});
</script>

<script lang="ts">
let remember = $state(true);
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Checkbox {...args} aria-label={label} />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={values} columns={energies}>
      {#snippet cell(value, energy)}
        <Checkbox {energy} checked={value === "checked"} aria-label={label} />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states} columns={energies}>
      {#snippet cell(state, energy)}
        <Checkbox {energy} {...stateProps[state]} aria-label={label} />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- The default soft Checkbox one well down shows faint, passed by hand: its frame and the disabled plate glaze, and a checked box's frame takes the well's focus ring. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Well>
      <Matrix rows={states}>
        {#snippet cell(state)}
          <Checkbox
            energy={resolveEnergy(undefined, energies, 1)}
            {...stateProps[state]}
            aria-label={label}
          />
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>

<Story name="With label" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <label class="flex items-center gap-2 font-sans text-sm text-fg">
      <Checkbox bind:checked={remember} />
      {label}
    </label>
  {/snippet}
</Story>
