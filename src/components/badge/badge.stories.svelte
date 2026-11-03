<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Badge from "./badge.svelte";

const intents = ["neutral", "info", "success", "warning", "danger"] as const;
const sizes = ["sm", "md", "lg"] as const;

const { Story } = defineMeta({
  title: "Feedback/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: "Uppercase mono label for a status, with an optional dot.",
      },
    },
  },
  args: { intent: "neutral", size: "sm", dot: false },
  argTypes: {
    intent: { control: "select", options: intents },
    size: { control: "inline-radio", options: sizes },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Badge {...args}>Pending</Badge>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents} columns={sizes}>
      {#snippet cell(intent, size)}
        <Badge {intent} {size}>{intent}</Badge>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="With dot" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents}>
      {#snippet cell(intent)}
        <Badge {intent} dot>{intent}</Badge>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
