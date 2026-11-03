<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import PhoneInput from "./phone-input.svelte";

const variants = ["default", "tinted", "outline"] as const;
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
    variant: "tinted",
    size: "md",
    placeholder: "601 123 456",
    invalid: false,
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
    <PhoneInput {...args} class="w-80" />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={variants} columns={sizes}>
      {#snippet cell(variant, size)}
        <PhoneInput
          {variant}
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
    <Matrix rows={states} columns={variants}>
      {#snippet cell(state, variant)}
        <PhoneInput
          {variant}
          country="cz"
          placeholder="601 123 456"
          class="w-60"
          {...stateProps[state]}
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
