<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Alert from "./alert.svelte";

const intents = ["danger", "success", "info", "warning"] as const;

const messages = {
  danger: "Enter a valid email address.",
  success: "Your changes have been saved.",
  info: "Verification usually takes a few minutes.",
  warning: "Your session expires in 5 minutes.",
} satisfies Record<(typeof intents)[number], string>;

const { Story } = defineMeta({
  title: "Feedback/Alert",
  component: Alert,
  parameters: {
    docs: {
      description: {
        component:
          "Short inline message for form errors and action results; the danger intent is announced as an alert.",
      },
    },
  },
  args: { intent: "danger" },
  argTypes: { intent: { control: "select", options: intents } },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Alert {...args}>{messages.danger}</Alert>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents}>
      {#snippet cell(intent)}
        <Alert {intent}>{messages[intent]}</Alert>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
