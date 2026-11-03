<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy, SHAPES } from "../../utils/energy.ts";
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
const energies = ["2", "1"] as const;
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
    energy: "2",
    size: "md",
    shape: "rounded",
    placeholder: "name@example.com",
    invalid: false,
    loading: false,
    disabled: false,
  },
  argTypes: {
    type: { control: "select", options: types },
    energy: { control: "inline-radio", options: energies },
    size: { control: "inline-radio", options: sizes },
    shape: { control: "inline-radio", options: SHAPES },
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
    <Matrix rows={energies} columns={sizes}>
      {#snippet cell(energy, size)}
        <Input
          {energy}
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
    <Matrix rows={states} columns={energies}>
      {#snippet cell(state, energy)}
        <Input
          {energy}
          type="email"
          placeholder="name@example.com"
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
          <Input
            energy={resolveEnergy(energy, energies, 1)}
            {size}
            type="email"
            placeholder="name@example.com"
            class="w-56"
          />
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>

<!-- shape="pill" for toolbars and search bars, at either level. -->
<Story name="Pill" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies} columns={sizes}>
      {#snippet cell(energy, size)}
        <Input
          {energy}
          {size}
          shape="pill"
          type="email"
          placeholder="name@example.com"
          class="w-56"
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
      <Input type="password" value="correct horse battery staple" />
      <Input type="number" value={3} min={0} max={10} />
    </div>
  {/snippet}
</Story>

<!-- mask: # takes a digit and A / a a letter or digit in capitals / lower case; any other character is inserted as the user types. -->
<Story name="Patterns" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-80 flex-col gap-3">
      <Input
        mask="### ## ###"
        inputmode="numeric"
        placeholder="Company ID: ### ## ###"
        aria-label="Company ID"
      />
      <Input
        mask="AAAA-AAAA-AAAA"
        placeholder="Licence key: AAAA-AAAA-AAAA"
        aria-label="Licence key"
      />
      <Input
        mask="aaaaaaa"
        placeholder="Data box: 7 characters"
        aria-label="Data box"
      />
    </div>
  {/snippet}
</Story>
