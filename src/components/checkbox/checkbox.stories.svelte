<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Checkbox from "./checkbox.svelte";

const states = ["default", "disabled"] as const;
const values = ["unchecked", "checked"] as const;

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
  args: { checked: false, disabled: false },
});
</script>

<script lang="ts">
let remember = $state(true);
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Checkbox {...args} aria-label="Remember this device" />
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states} columns={values}>
      {#snippet cell(state, value)}
        <Checkbox
          checked={value === "checked"}
          disabled={state === "disabled"}
          aria-label="Remember this device"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="With label" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <label class="flex items-center gap-2 font-sans text-sm text-fg">
      <Checkbox bind:checked={remember} />
      Remember this device
    </label>
  {/snippet}
</Story>
