<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy, SHAPES } from "../../utils/energy.ts";
import PhoneInput from "./phone-input.svelte";

const energies = ["2", "1"] as const;
const sizes = ["sm", "md", "lg"] as const;
const states = ["default", "filled", "invalid", "disabled"] as const;
const stateProps = {
  default: {},
  filled: { value: "601 123 456" },
  invalid: { value: "601 123", invalid: true },
  disabled: { disabled: true },
};

const { Story } = defineMeta({
  title: "Inputs/PhoneInput",
  component: PhoneInput,
  parameters: {
    docs: {
      description: {
        component:
          "Phone number field with a searchable country-code picker, built on bits-ui Popover and Command; import it from @gravity-community/svelte/phone-input.",
      },
    },
  },
  args: {
    country: "cz",
    energy: "2",
    size: "md",
    shape: "rounded",
    placeholder: "601 123 456",
    invalid: false,
    disabled: false,
  },
  argTypes: {
    energy: { control: "inline-radio", options: energies },
    size: { control: "inline-radio", options: sizes },
    shape: { control: "inline-radio", options: SHAPES },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <PhoneInput {...args} class="w-80" />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies} columns={sizes}>
      {#snippet cell(energy, size)}
        <PhoneInput
          {energy}
          {size}
          country="cz"
          placeholder="601 123 456"
          class="w-60"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states} columns={energies}>
      {#snippet cell(state, energy)}
        <PhoneInput
          {energy}
          country="cz"
          placeholder="601 123 456"
          class="w-60"
          {...stateProps[state]}
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Rows name the level each field is given; one well down both decay to faint, passed by hand, and the frame glazes. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Well>
      <Matrix rows={energies} columns={sizes}>
        {#snippet cell(energy, size)}
          <PhoneInput
            energy={resolveEnergy(energy, energies, 1)}
            {size}
            country="cz"
            placeholder="601 123 456"
            class="w-60"
          />
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>

<Story name="Pill" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies} columns={sizes}>
      {#snippet cell(energy, size)}
        <PhoneInput
          {energy}
          {size}
          shape="pill"
          country="cz"
          placeholder="601 123 456"
          class="w-60"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
