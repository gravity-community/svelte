<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Link from "./link.svelte";

const intents = [
  "accent",
  "neutral",
  "muted",
  "info",
  "success",
  "warning",
  "danger",
] as const;
const sizes = ["sm", "md"] as const;
const states = ["default", "disabled", "disabled button"] as const;
const stateProps = {
  default: { href: "#" },
  disabled: { href: "#", disabled: true },
  "disabled button": { disabled: true },
};

const { Story } = defineMeta({
  title: "Actions/Link",
  component: Link,
  parameters: {
    docs: {
      description: {
        component:
          "Low-emphasis text action that navigates with an href or acts as a button without one, built on bits-ui Button. Underlined on hover only.",
      },
    },
  },
  args: { intent: "accent", size: "sm", href: "#", disabled: false },
  argTypes: {
    intent: { control: "select", options: intents },
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

<!-- A disabled link drops its href and leaves the tab order; a disabled button gets the disabled attribute. -->
<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states} columns={intents}>
      {#snippet cell(state, intent)}
        <Link {intent} {...stateProps[state]}>View details</Link>
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

<!-- muted sits back beside helper text, for a way out the reader rarely needs. -->
<Story name="Muted" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Link intent="muted">
      Not in the public registers? Enter the details manually.
    </Link>
  {/snippet}
</Story>
