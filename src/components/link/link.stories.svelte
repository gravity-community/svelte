<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Link from "./link.svelte";

const intents = ["accent", "neutral", "danger"] as const;
const sizes = ["sm", "md"] as const;

const { Story } = defineMeta({
  title: "Actions/Link",
  component: Link,
  parameters: {
    docs: {
      description: {
        component:
          "Low-emphasis text action that navigates with an href or acts as a button without one, built on bits-ui Button.",
      },
    },
  },
  args: { intent: "accent", size: "sm", href: "#" },
  argTypes: {
    intent: { control: "inline-radio", options: intents },
    size: { control: "inline-radio", options: sizes },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Link {...args}>View details</Link>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents} columns={sizes}>
      {#snippet cell(intent, size)}
        <Link {intent} {size} href="#">View details</Link>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Without an href it renders a type="button" button, so it never submits a surrounding form. -->
<Story name="As a button" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Link intent="neutral">Clear selection ×</Link>
  {/snippet}
</Story>
