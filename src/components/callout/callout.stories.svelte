<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Icon from "../icon/icon.svelte";
import Callout from "./callout.svelte";

const intents = ["info", "warning"] as const;

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
          "Info or warning note set apart from the surrounding prose, with an optional title.",
      },
    },
  },
  args: { intent: "info", title: "Before you start" },
  argTypes: {
    intent: { control: "inline-radio", options: intents },
    title: { control: "text" },
  },
});
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
    <Matrix rows={intents}>
      {#snippet cell(intent)}
        <Callout {intent} title={notes[intent].title} class="w-[480px]">
          {notes[intent].body}
        </Callout>
      {/snippet}
    </Matrix>
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
