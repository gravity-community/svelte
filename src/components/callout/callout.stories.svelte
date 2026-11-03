<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy } from "../../utils/energy.ts";
import Button from "../button/button.svelte";
import Icon from "../icon/icon.svelte";
import Callout from "./callout.svelte";

const intents = ["info", "warning"] as const;
const energies = ["2", "1", "0"] as const;

const notes = {
  info: {
    title: "Good to know",
    body:
      "API keys are scoped to one workspace. Create one per environment so you can revoke them independently.",
  },
  warning: {
    title: "Heads up",
    body:
      "Deleting a workspace also deletes its records and keys. This can't be undone.",
  },
} satisfies Record<(typeof intents)[number], { title: string; body: string }>;

const { Story } = defineMeta({
  title: "Feedback/Callout",
  component: Callout,
  parameters: {
    docs: {
      description: {
        component:
          "Info or warning note set apart from the surrounding prose, with an optional title and actions.",
      },
    },
  },
  args: { intent: "info", energy: "2", title: "Before you start" },
  argTypes: {
    intent: { control: "inline-radio", options: intents },
    energy: { control: "inline-radio", options: energies },
    title: { control: "text" },
  },
});
</script>

<script lang="ts">
let saved = $state(false);
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Callout {...args} class="w-[480px]">
      You need an API key to call these endpoints. Create one under Settings,
      then API keys.
    </Callout>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents} columns={energies}>
      {#snippet cell(intent, energy)}
        <Callout
          {intent}
          {energy}
          title={notes[intent].title}
          class="w-[400px]"
        >
          {notes[intent].body}
        </Callout>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Actions given no energy match the Callout's level. -->
<Story name="With actions" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Callout title="No API key yet" class="w-[480px]">
      You need an API key to call these endpoints.
      {#snippet actions()}
        <Button size="sm">Create a key</Button>
      {/snippet}
    </Callout>
  {/snippet}
</Story>

<Story name="Custom icon" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Callout title="Keep your key secret" class="w-[480px]">
      {#snippet icon()}
        <Icon glyph="key" class="size-full" />
      {/snippet}
      Anyone holding the key can act for your workspace. Rotate it straight
      away if it leaks.
    </Callout>
  {/snippet}
</Story>

<!-- Columns name the level each Callout is given; one well down it shows a level lower, stopping at ghost. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Well>
      <Matrix rows={intents} columns={energies}>
        {#snippet cell(intent, energy)}
          <Callout
            {intent}
            energy={resolveEnergy(energy, energies, 1)}
            title={notes[intent].title}
            class="w-[400px]"
          >
            {notes[intent].body}
          </Callout>
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>

<!-- The icon is a bare glyph whose ink follows the level; the actions match it. A warning action sits on the deep glaze of the soft warning box. -->
<Story name="Parts" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies} columns={intents}>
      {#snippet cell(energy, intent)}
        <Callout
          {intent}
          {energy}
          title={notes[intent].title}
          class="w-[400px]"
        >
          {notes[intent].body}
          {#snippet actions()}
            {#if intent === "warning"}
              <Button size="sm" intent="warning">Export records</Button>
            {:else}
              <Button size="sm">Create a key</Button>
            {/if}
            <Button size="sm" intent="neutral">Learn more</Button>
          {/snippet}
        </Callout>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- With a screen reader on, press Save: the callout is read as it appears, once the reader is idle. -->
<Story name="Live region" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-[480px] flex-col items-start gap-4">
      <Button
        energy="-2"
        intent="neutral"
        size="sm"
        onclick={() => (saved = !saved)}
      >
        {saved ? "Discard" : "Save"}
      </Button>
      {#if saved}
        <Callout live="polite" title="Saved as a draft" class="w-full">
          Nothing is published until you submit the record.
        </Callout>
      {/if}
    </div>
  {/snippet}
</Story>
