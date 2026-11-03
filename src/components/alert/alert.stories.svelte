<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy } from "../../utils/energy.ts";
import Button from "../button/button.svelte";
import Alert from "./alert.svelte";

const intents = ["danger", "success", "info", "warning"] as const;
const energies = ["2", "1", "0"] as const;

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
  args: { intent: "danger", energy: "2" },
  argTypes: {
    intent: { control: "select", options: intents },
    energy: { control: "inline-radio", options: energies },
  },
});
</script>

<script lang="ts">
let dismissed = $state(false);
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Alert {...args}>{messages.danger}</Alert>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents} columns={energies}>
      {#snippet cell(intent, energy)}
        <Alert {intent} {energy}>{messages[intent]}</Alert>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Dismiss hides the Alert; its close is ghost neutral at every level. -->
<Story name="With close" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-[360px] flex-col items-start gap-4">
      {#if dismissed}
        <Button
          energy="-2"
          intent="neutral"
          size="sm"
          onclick={() => (dismissed = false)}
        >
          Show again
        </Button>
      {:else}
        <Alert intent="success" class="w-full" onclose={() => (dismissed = true)}>
          {messages.success}
        </Alert>
      {/if}
    </div>
  {/snippet}
</Story>

<!-- Columns name the level each Alert is given; one well down it shows a level lower, stopping at ghost. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Well>
      <Matrix rows={intents} columns={energies}>
        {#snippet cell(intent, energy)}
          <Alert {intent} energy={resolveEnergy(energy, energies, 1)}>
            {messages[intent]}
          </Alert>
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>

<!-- The icon is a bare glyph whose ink follows the level; the close stays ghost neutral. -->
<Story name="Parts" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies} columns={intents}>
      {#snippet cell(energy, intent)}
        <Alert {intent} {energy} onclose={() => {}}>{messages[intent]}</Alert>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
