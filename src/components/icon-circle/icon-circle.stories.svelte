<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Icon from "../icon/icon.svelte";
import IconCircle from "./icon-circle.svelte";

const intents = ["neutral", "info", "success", "warning", "danger"] as const;
const sizes = ["sm", "md"] as const;
const counts = ["3", "35", "99+"];

const { Story } = defineMeta({
  title: "Data display/IconCircle",
  component: IconCircle,
  parameters: {
    docs: {
      description: {
        component:
          "A glyph or a short count in a tinted disc, used as leading media or as a status mark.",
      },
    },
  },
  args: { intent: "neutral", size: "md" },
  argTypes: {
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

<Story name="Sizes" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={sizes}>
      {#snippet cell(size)}
        <IconCircle {size}>
          <Icon glyph="document" class="size-full" />
        </IconCircle>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Intents" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents}>
      {#snippet cell(intent)}
        <IconCircle {intent}>
          <Icon glyph="document" class="size-full" />
        </IconCircle>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Text" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={sizes}>
      {#snippet cell(size)}
        <div class="flex items-center gap-3">
          {#each counts as count (count)}
            <IconCircle {size} text={count} />
          {/each}
          <IconCircle {size} intent="success">
            <Icon glyph="check-full" class="size-full" />
          </IconCircle>
          <IconCircle {size} intent="warning">
            <Icon glyph="warning-full" class="size-full" />
          </IconCircle>
        </div>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
