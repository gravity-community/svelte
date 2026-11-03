<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
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
const variants = ["default", "tinted", "outline"] as const;
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
    variant: "tinted",
    size: "md",
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
    <Select {...args} class="w-80" />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={variants} columns={sizes}>
      {#snippet cell(variant, size)}
        <Select
          {variant}
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
    <Matrix rows={states} columns={variants}>
      {#snippet cell(state, variant)}
        <Select
          {variant}
          {items}
          placeholder="Choose a role"
          class="w-56"
          {...stateProps[state]}
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- A pill sized to its content, as a view switcher in a toolbar. -->
<Story name="Outline" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Select
      variant="outline"
      size="sm"
      items={scopes}
      value="all"
      aria-label="Norms"
      class="w-auto"
    />
  {/snippet}
</Story>

<!-- Open it: a rule sets each group apart, and its heading is optional. -->
<Story name="Groups" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Select
      variant="tinted"
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
        <Select variant="tinted" items={norms} value={norm.value} />
      {/each}
    </div>
  {/snippet}
</Story>

<Story name="Disabled item" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Select
      variant="tinted"
      items={[...items, { value: "owner", label: "Owner", disabled: true }]}
      placeholder="Choose a role"
      class="w-80"
    />
  {/snippet}
</Story>
