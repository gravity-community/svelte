<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Progress from "./progress.svelte";

const intents = ["primary", "info", "success", "warning", "danger"] as const;
const sizes = ["sm", "md"] as const;

// bits-ui's prop types slip every HTML attribute past the docgen filter.
const ownProps = [
  "value",
  "min",
  "max",
  "label",
  "valueLabel",
  "segmented",
  "intent",
  "size",
];

const { Story } = defineMeta({
  title: "Feedback/Progress",
  component: Progress,
  parameters: {
    docs: {
      description: {
        component:
          "Bar that shows how far a task has come, whole or in segments, built on bits-ui Progress.",
      },
      controls: { include: ownProps },
    },
    controls: { include: ownProps },
  },
  args: {
    value: 60,
    max: 100,
    label: "Upload",
    valueLabel: "60 %",
    segmented: false,
    intent: "primary",
    size: "sm",
  },
  argTypes: {
    intent: { control: "select", options: intents },
    size: { control: "inline-radio", options: sizes },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Progress {...args} class="w-80" />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents} columns={sizes}>
      {#snippet cell(intent, size)}
        <Progress {intent} {size} value={60} aria-label={intent} class="w-60" />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Segmented" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents} columns={sizes}>
      {#snippet cell(intent, size)}
        <Progress
          {intent}
          {size}
          segmented
          value={3}
          max={5}
          aria-label={intent}
          class="w-60"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Guide" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Progress
      value={2}
      max={9}
      label="Next: add the deed of Interzone Holding a.s."
      valueLabel="2 of 9 steps"
      class="w-96"
    />
  {/snippet}
</Story>
