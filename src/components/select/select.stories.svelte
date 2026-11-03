<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy, SHAPES } from "../../utils/energy.ts";
import Select from "./select.svelte";
import type { SelectGroup, SelectItem } from "./types.ts";

const items = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
];
const norms = [
  {
    value: "aml",
    label: "AML",
    status: { intent: "success", filled: true, label: "Ready" },
  },
  {
    value: "kyc",
    label: "KYC",
    status: { intent: "neutral", label: "Unfinished" },
  },
  {
    value: "tax",
    label: "Tax",
    status: { intent: "info", filled: true, label: "New work" },
  },
  {
    value: "esg",
    label: "ESG",
    status: { intent: "warning", filled: true, label: "Blocked for now" },
  },
  {
    value: "sanctions",
    label: "Sanctions",
    status: { intent: "danger", filled: true, label: "Needs a fix" },
  },
] satisfies SelectItem[];
const groups = [
  { value: "all", label: "All norms" },
  {
    label: "Norms",
    items: [
      { value: "aml", label: "AML" },
      { value: "kyc", label: "KYC" },
    ],
  },
  { items: [{ value: "archived", label: "Archived norms" }] },
] satisfies (SelectItem | SelectGroup)[];
const scopes = [
  {
    value: "all",
    label: "TXP",
    status: { intent: "info", filled: true, label: "New work" },
  },
  { label: "Norms", items: norms.slice(0, 3) },
] satisfies (SelectItem | SelectGroup)[];
const energies = ["2", "1"] as const;
const sizes = ["sm", "md", "lg"] as const;
const states = ["default", "filled", "invalid", "disabled"] as const;
const stateProps = {
  default: {},
  filled: { value: "editor" },
  invalid: { invalid: true },
  disabled: { disabled: true },
};

const { Story } = defineMeta({
  title: "Inputs/Select",
  component: Select,
  parameters: {
    docs: {
      description: {
        component:
          "Picks one option from a list, optionally grouped and with status dots, built on bits-ui Select.",
      },
    },
  },
  args: {
    items,
    value: "",
    placeholder: "Choose a role",
    energy: "2",
    size: "md",
    shape: "rounded",
    invalid: false,
    disabled: false,
    clearable: false,
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
    <Select {...args} class="w-80" />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies} columns={sizes}>
      {#snippet cell(energy, size)}
        <Select
          {energy}
          {size}
          {items}
          placeholder="Choose a role"
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
        <Select
          {energy}
          {items}
          placeholder="Choose a role"
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
          <Select
            energy={resolveEnergy(energy, energies, 1)}
            {size}
            {items}
            placeholder="Choose a role"
            class="w-56"
          />
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>

<!-- A pill sized to its content, as a view switcher in a toolbar. -->
<Story name="Pill" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies}>
      {#snippet cell(energy)}
        <Select
          {energy}
          shape="pill"
          size="sm"
          items={scopes}
          value="all"
          aria-label="Norms"
          class="w-auto"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Open it: a rule sets each group apart, and its heading is optional. -->
<Story name="Groups" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Select
      items={groups}
      placeholder="Choose a view"
      class="w-80"
    />
  {/snippet}
</Story>

<!-- The dot is decorative: an option's name carries its status ("Tax, New work"). -->
<Story name="Statuses" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-80 flex-col gap-3">
      {#each norms as norm (norm.value)}
        <Select items={norms} value={norm.value} />
      {/each}
    </div>
  {/snippet}
</Story>

<Story name="Disabled item" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Select
      items={[...items, { value: "owner", label: "Owner", disabled: true }]}
      placeholder="Choose a role"
      class="w-80"
    />
  {/snippet}
</Story>

<!-- clearable: the cross of Combobox's held pick, before the chevron. It, Backspace or Delete empty the value. -->
<Story name="Clearable" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies} columns={sizes}>
      {#snippet cell(energy, size)}
        <Select
          {energy}
          {size}
          {items}
          value="editor"
          placeholder="Choose a role"
          clearable
          class="w-56"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
