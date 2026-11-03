<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Icon from "../icon/icon.svelte";
import Input from "./input.svelte";

const types = [
  "text",
  "email",
  "password",
  "search",
  "tel",
  "url",
  "number",
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
] as const;
const variants = ["default", "tinted", "outline"] as const;
const sizes = ["sm", "md", "lg"] as const;
const states = ["default", "filled", "invalid", "disabled", "loading"] as const;
const stateProps = {
  default: {},
  filled: { value: "jane@example.com" },
  invalid: { value: "jane.example.com", invalid: true },
  disabled: { disabled: true },
  loading: { value: "jane@example.com", loading: true },
};
const slots = ["leading icon", "trailing icon"] as const;

const { Story } = defineMeta({
  title: "Inputs/Input",
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          "One-line text field for the native text-like types, with icon slots, a password reveal and number steppers.",
      },
    },
  },
  args: {
    type: "email",
    variant: "tinted",
    size: "md",
    placeholder: "name@example.com",
    invalid: false,
    loading: false,
    disabled: false,
  },
  argTypes: {
    type: { control: "select", options: types },
    variant: { control: "inline-radio", options: variants },
    size: { control: "inline-radio", options: sizes },
  },
});
</script>

{#snippet mail()}
  <Icon glyph="mail" class="size-full" />
{/snippet}

<Story name="Playground">
  {#snippet template(args)}
    <Input {...args} class="w-80" />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={variants} columns={sizes}>
      {#snippet cell(variant, size)}
        <Input
          {variant}
          {size}
          type="email"
          placeholder="name@example.com"
          class="w-56"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states} columns={variants}>
      {#snippet cell(state, variant)}
        <Input
          {variant}
          type="email"
          placeholder="name@example.com"
          class="w-56"
          {...stateProps[state]}
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="With icons" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={sizes} columns={slots}>
      {#snippet cell(size, slot)}
        <Input
          variant="tinted"
          {size}
          type="email"
          placeholder="name@example.com"
          class="w-64"
          leadingIcon={slot === "leading icon" ? mail : undefined}
          trailingIcon={slot === "trailing icon" ? mail : undefined}
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- The type's own control takes the trailing slot; loading replaces it while it runs. -->
<Story name="Trailing controls" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-80 flex-col gap-3">
      <Input
        variant="tinted"
        type="password"
        value="correct horse battery staple"
      />
      <Input variant="tinted" type="number" value={3} min={0} max={10} />
    </div>
  {/snippet}
</Story>

<!-- mask: # takes a digit and A / a a letter or digit in capitals / lower case; any other character is inserted as the user types. -->
<Story name="Patterns" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-80 flex-col gap-3">
      <Input
        variant="tinted"
        mask="### ## ###"
        inputmode="numeric"
        placeholder="Company ID: ### ## ###"
        aria-label="Company ID"
      />
      <Input
        variant="tinted"
        mask="AAAA-AAAA-AAAA"
        placeholder="Licence key: AAAA-AAAA-AAAA"
        aria-label="Licence key"
      />
      <Input
        variant="tinted"
        mask="aaaaaaa"
        placeholder="Data box: 7 characters"
        aria-label="Data box"
      />
    </div>
  {/snippet}
</Story>
