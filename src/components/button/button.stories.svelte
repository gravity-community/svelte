<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Icon from "../icon/icon.svelte";
import Button from "./button.svelte";

const variants = ["solid", "soft", "outline", "ghost"] as const;
const intents = [
  "primary",
  "success",
  "warning",
  "danger",
  "neutral",
  "accent",
] as const;
const sizes = ["sm", "md", "lg"] as const;
const shapes = ["rounded", "pill"] as const;
const contents = ["label", "leading icon", "icon only"] as const;
const states = [
  "default",
  "disabled",
  "loading",
  "icon only",
  "link",
  "disabled link",
] as const;
const stateProps = {
  default: {},
  disabled: { disabled: true },
  loading: { loading: true },
  link: { href: "#" },
  "disabled link": { href: "#", disabled: true },
};

const { Story } = defineMeta({
  title: "Actions/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Runs an action, or navigates when given an href, built on bits-ui Button.",
      },
    },
  },
  args: {
    variant: "solid",
    intent: "primary",
    size: "md",
    shape: "rounded",
    disabled: false,
    loading: false,
    gravity: true,
  },
  argTypes: {
    variant: { control: "select", options: variants },
    intent: { control: "select", options: intents },
    size: { control: "inline-radio", options: sizes },
    shape: { control: "inline-radio", options: shapes },
    gravity: { control: "boolean" },
  },
});
</script>

{#snippet search()}
  <Icon glyph="search" class="size-full" />
{/snippet}

{#snippet arrowRight()}
  <Icon glyph="arrow-right" class="size-full" />
{/snippet}

<Story name="Playground">
  {#snippet template(args)}
    <Button {...args}>Save changes</Button>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={variants} columns={intents}>
      {#snippet cell(variant, intent)}
        <Button {variant} {intent}>Button</Button>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Sizes" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={sizes} columns={contents}>
      {#snippet cell(size, content)}
        {#if content === "icon only"}
          <Button {size} leadingIcon={search} aria-label="Search" />
        {:else}
          <Button
            {size}
            leadingIcon={content === "leading icon" ? search : undefined}
          >
            Search
          </Button>
        {/if}
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states} columns={variants}>
      {#snippet cell(state, variant)}
        {#if state === "icon only"}
          <Button {variant} leadingIcon={search} aria-label="Search" />
        {:else}
          <Button {variant} {...stateProps[state]}>Button</Button>
        {/if}
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Trailing icon" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={sizes}>
      {#snippet cell(size)}
        <Button {size} trailingIcon={arrowRight}>04 Evidence</Button>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Pill" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex items-center gap-3">
      <Button shape="pill" trailingIcon={arrowRight}>04 Evidence</Button>
      <Button shape="pill" variant="outline">Save draft</Button>
      <Button shape="pill" variant="soft">Preview</Button>
    </div>
  {/snippet}
</Story>
