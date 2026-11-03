<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy, SHAPES } from "../../utils/energy.ts";
import SearchInput from "./search-input.svelte";

const energies = ["2", "1"] as const;
const sizes = ["sm", "md", "lg"] as const;
const states = ["default", "filled", "loading", "disabled"] as const;
const stateProps = {
  default: {},
  filled: { value: "quarterly report" },
  loading: { value: "quarterly report", loading: true },
  disabled: { disabled: true },
};

const { Story } = defineMeta({
  title: "Inputs/SearchInput",
  component: SearchInput,
  parameters: {
    docs: {
      description: {
        component:
          "Input preset for search: type search and a leading search icon.",
      },
    },
  },
  args: {
    energy: "2",
    size: "md",
    shape: "rounded",
    placeholder: "Search",
    loading: false,
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
    <SearchInput {...args} class="w-80" />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies} columns={sizes}>
      {#snippet cell(energy, size)}
        <SearchInput {energy} {size} placeholder="Search" class="w-56" />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states} columns={energies}>
      {#snippet cell(state, energy)}
        <SearchInput
          {energy}
          placeholder="Search"
          class="w-56"
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
          <SearchInput
            energy={resolveEnergy(energy, energies, 1)}
            {size}
            placeholder="Search"
            class="w-56"
          />
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>

<!-- A search bar in a toolbar takes shape="pill", at either level. -->
<Story name="Pill" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies} columns={sizes}>
      {#snippet cell(energy, size)}
        <SearchInput
          {energy}
          {size}
          shape="pill"
          placeholder="Search"
          class="w-56"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
