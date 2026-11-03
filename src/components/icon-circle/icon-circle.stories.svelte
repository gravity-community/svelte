<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { ENERGY, resolveEnergy } from "../../utils/energy.ts";
import Icon from "../icon/icon.svelte";
import IconCircle from "./icon-circle.svelte";

const intents = [
  "primary",
  "neutral",
  "info",
  "success",
  "warning",
  "danger",
] as const;
const sizes = ["sm", "md", "lg", "xl"] as const;
const counts = ["3", "35", "99+"];

const { Story } = defineMeta({
  title: "Data display/IconCircle",
  component: IconCircle,
  parameters: {
    docs: {
      description: {
        component:
          "A glyph or a short count in a disc, used as leading media or as a status mark.",
      },
    },
  },
  args: { energy: "3", intent: "neutral", size: "md" },
  argTypes: {
    energy: { control: "inline-radio", options: ENERGY },
    intent: { control: "select", options: intents },
    size: { control: "inline-radio", options: sizes },
    text: { control: "text" },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <IconCircle {...args}>
      <Icon glyph="document" class="size-full" />
    </IconCircle>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents} columns={ENERGY}>
      {#snippet cell(intent, energy)}
        <IconCircle {intent} {energy}>
          <Icon glyph="document" class="size-full" />
        </IconCircle>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Sizes" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={sizes} columns={ENERGY}>
      {#snippet cell(size, energy)}
        <IconCircle {size} {energy}>
          <Icon glyph="document" class="size-full" />
        </IconCircle>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Columns name the level each circle is given; one well down it shows a level lower, stopping at ghost, and its soft fill is a glaze. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Well>
      <Matrix rows={intents} columns={ENERGY}>
        {#snippet cell(intent, energy)}
          <IconCircle {intent} energy={resolveEnergy(energy, ENERGY, 1)}>
            <Icon glyph="document" class="size-full" />
          </IconCircle>
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>

<Story name="Text" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={sizes}>
      {#snippet cell(size)}
        <div class="flex items-center gap-3">
          {#each counts as count (count)}
            <IconCircle {size} energy="-1" text={count} />
          {/each}
          <IconCircle {size} energy="-1" intent="success">
            <Icon glyph="check" class="size-full" />
          </IconCircle>
          <IconCircle {size} energy="-1" intent="warning">
            <Icon glyph="warning" class="size-full" />
          </IconCircle>
        </div>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
