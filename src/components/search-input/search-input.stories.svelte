<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import SearchInput from "./search-input.svelte";

const variants = ["default", "tinted", "outline"] as const;
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
          "Input preset for search: type search, a leading search icon and the tinted variant by default.",
      },
    },
  },
  args: {
    variant: "tinted",
    size: "md",
    placeholder: "Search",
    loading: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: variants },
    size: { control: "inline-radio", options: sizes },
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
    <Matrix rows={variants} columns={sizes}>
      {#snippet cell(variant, size)}
        <SearchInput {variant} {size} placeholder="Search" class="w-56" />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states} columns={variants}>
      {#snippet cell(state, variant)}
        <SearchInput
          {variant}
          placeholder="Search"
          class="w-56"
          {...stateProps[state]}
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
