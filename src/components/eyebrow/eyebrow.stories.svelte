<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Eyebrow from "./eyebrow.svelte";

const intents = [
  "neutral",
  "primary",
  "info",
  "success",
  "warning",
  "danger",
] as const;

const { Story } = defineMeta({
  title: "Data display/Eyebrow",
  component: Eyebrow,
  parameters: {
    docs: {
      description: {
        component:
          "A small uppercase label that introduces a section, with optional trailing meta.",
      },
    },
  },
  args: { intent: "neutral" },
  argTypes: {
    intent: { control: "select", options: intents },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Eyebrow {...args}>Section</Eyebrow>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents}>
      {#snippet cell(intent)}
        <Eyebrow {intent}>Section</Eyebrow>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="With meta" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Eyebrow intent="primary" class="w-[320px]">
      Company details
      {#snippet meta()}Step 2 of 4{/snippet}
    </Eyebrow>
  {/snippet}
</Story>
