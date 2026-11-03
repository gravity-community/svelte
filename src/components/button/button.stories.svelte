<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { ENERGY, resolveEnergy, SHAPES } from "../../utils/energy.ts";
import Icon from "../icon/icon.svelte";
import Button from "./button.svelte";

const intents = [
  "primary",
  "success",
  "warning",
  "danger",
  "neutral",
  "accent",
] as const;
const sizes = ["sm", "md", "lg"] as const;
const contents = ["label", "leading icon", "icon only"] as const;
const states = [
  "default",
  "held",
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
    energy: "3",
    intent: "primary",
    size: "md",
    shape: "rounded",
    disabled: false,
    loading: false,
    gravity: true,
  },
  argTypes: {
    energy: { control: "select", options: ENERGY },
    intent: { control: "select", options: intents },
    size: { control: "inline-radio", options: sizes },
    shape: { control: "inline-radio", options: SHAPES },
    gravity: { control: "boolean" },
  },
});
</script>

{#snippet search()}
  <Icon glyph="search" class="size-full" />
{/snippet}

{#snippet check()}
  <Icon glyph="check" class="size-full" />
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
    <Matrix rows={ENERGY} columns={intents}>
      {#snippet cell(energy, intent)}
        <Button {energy} {intent}>Button</Button>
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

<!-- Faint and ghost keep a fill while held (aria-pressed here), so a held toggle also gains a check; a disabled ghost is ink alone. -->
<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states} columns={ENERGY}>
      {#snippet cell(state, energy)}
        {#if state === "icon only"}
          <Button {energy} leadingIcon={search} aria-label="Search" />
        {:else if state === "held"}
          <Button {energy} aria-pressed leadingIcon={check}>Button</Button>
        {:else}
          <Button {energy} {...stateProps[state]}>Button</Button>
        {/if}
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Rows are the level each Button is given; inside a filled well it shows one level lower, passed by hand, and soft fills turn to a glaze. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex flex-col gap-6">
      <Well>
        <Matrix rows={ENERGY} columns={intents}>
          {#snippet cell(energy, intent)}
            <Button energy={resolveEnergy(energy, ENERGY, 1)} {intent}>Button</Button>
          {/snippet}
        </Matrix>
      </Well>
      <Well intent="info">
        <Matrix rows={ENERGY} columns={intents}>
          {#snippet cell(energy, intent)}
            <Button energy={resolveEnergy(energy, ENERGY, 1)} {intent}>Button</Button>
          {/snippet}
        </Matrix>
      </Well>
    </div>
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

<!-- A ghost pill's hover and held fills are pills too; icon-only stays a circle at either shape. -->
<Story name="Pill" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={ENERGY} columns={contents}>
      {#snippet cell(energy, content)}
        {#if content === "icon only"}
          <Button
            {energy}
            shape="pill"
            leadingIcon={search}
            aria-label="Search"
          />
        {:else}
          <Button
            {energy}
            shape="pill"
            leadingIcon={content === "leading icon" ? search : undefined}
          >
            Search
          </Button>
        {/if}
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
