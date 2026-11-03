<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy } from "../../utils/energy.ts";
import Badge from "./badge.svelte";

const intents = ["neutral", "info", "success", "warning", "danger"] as const;
const energies = ["2", "1", "0"] as const;
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
  args: { energy: "2", intent: "neutral", size: "sm", dot: false },
  argTypes: {
    energy: { control: "inline-radio", options: energies },
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
    <Matrix rows={intents} columns={energies}>
      {#snippet cell(intent, energy)}
        <Badge {intent} {energy}>{intent}</Badge>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Sizes" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents} columns={sizes}>
      {#snippet cell(intent, size)}
        <Badge {intent} {size}>{intent}</Badge>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- The dot is the Badge's own part: it keeps the intent's solid colour at every level. -->
<Story name="With dot" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents} columns={energies}>
      {#snippet cell(intent, energy)}
        <Badge {intent} {energy} dot>{intent}</Badge>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Columns name the level each badge is given; one well down it shows a level lower, stopping at ghost, and its soft fill is a glaze. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex flex-col gap-6">
      <Well>
        <Matrix rows={intents} columns={energies}>
          {#snippet cell(intent, energy)}
            <Badge {intent} energy={resolveEnergy(energy, energies, 1)}>
              {intent}
            </Badge>
          {/snippet}
        </Matrix>
      </Well>
      <Well intent="info">
        <Matrix rows={intents} columns={energies}>
          {#snippet cell(intent, energy)}
            <Badge {intent} energy={resolveEnergy(energy, energies, 1)}>
              {intent}
            </Badge>
          {/snippet}
        </Matrix>
      </Well>
    </div>
  {/snippet}
</Story>
