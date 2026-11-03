<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Dot from "./dot.svelte";

const intents = ["neutral", "info", "success", "warning", "danger"] as const;
const fills = ["hollow", "filled"] as const;

const { Story } = defineMeta({
  title: "Feedback/Dot",
  component: Dot,
  parameters: {
    docs: {
      description: {
        component:
          "Small decorative marker beside a status label: hue carries the meaning, fill the state.",
      },
    },
  },
  args: { intent: "neutral", filled: false },
  argTypes: { intent: { control: "select", options: intents } },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <span class="flex items-center gap-1.5 text-sm text-fg">
      <Dot {...args} />
      Pending review
    </span>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents} columns={fills}>
      {#snippet cell(intent, fill)}
        <Dot {intent} filled={fill === "filled"} />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
