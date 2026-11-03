<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Text from "./text.svelte";

const types = [
  "display",
  "title",
  "heading",
  "subheading",
  "label",
  "overline",
] as const;
const elements = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span"] as const;

const { Story } = defineMeta({
  title: "Typography/Text",
  component: Text,
  parameters: {
    docs: {
      description: {
        component:
          "Text set in one of the type roles, rendered as the role's heading level unless `as` overrides it.",
      },
    },
  },
  args: { type: "label" },
  argTypes: {
    type: { control: "select", options: types },
    as: { control: "select", options: elements },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Text {...args}>Account settings</Text>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={types}>
      {#snippet cell(type)}
        <Text {type}>The quick brown fox</Text>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
