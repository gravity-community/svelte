<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy } from "../../utils/energy.ts";
import Button from "../button/button.svelte";
import Spinner from "../spinner/spinner.svelte";
import Status from "./status.svelte";

const intents = ["neutral", "info", "success", "warning", "danger"] as const;
const energies = ["2", "1", "0"] as const;
const sizes = ["sm", "md", "lg"] as const;
const actionsLayouts = ["inline", "stretch"] as const;
const mainIntents = ["primary", "danger"] as const;

const messages = {
  neutral: {
    title: "Nothing here yet",
    body: "Records you create will appear here.",
  },
  info: {
    title: "Review in progress",
    body: "We'll email you as soon as the review is complete.",
  },
  success: {
    title: "Request submitted",
    body: "Your request has been submitted and is pending review.",
  },
  warning: {
    title: "Action required",
    body: "Upload a proof of address to finish your application.",
  },
  danger: {
    title: "Something went wrong",
    body: "An unexpected error occurred. Please try again later.",
  },
} satisfies Record<(typeof intents)[number], { title: string; body: string }>;

const { Story } = defineMeta({
  title: "Feedback/Status",
  component: Status,
  parameters: {
    docs: {
      description: {
        component:
          "Centred message for the empty, success, error or loading state of a page or panel.",
      },
    },
  },
  args: {
    intent: "neutral",
    energy: "2",
    size: "md",
    pulse: false,
    actionsLayout: "inline",
    ...messages.neutral,
  },
  argTypes: {
    intent: { control: "select", options: intents },
    energy: { control: "inline-radio", options: energies },
    size: { control: "inline-radio", options: sizes },
    actionsLayout: { control: "inline-radio", options: actionsLayouts },
    eyebrow: { control: "text" },
  },
});
</script>

<!-- The main action matches the Status's level; the second stays ghost neutral. -->
<Story name="Playground">
  {#snippet template(args)}
    <Status {...args}>
      {#snippet actions()}
        <Button size={args.size}>Create record</Button>
        <Button size={args.size} energy="0" intent="neutral">Import</Button>
      {/snippet}
    </Status>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents} columns={energies}>
      {#snippet cell(intent, energy)}
        <Status {intent} {energy} size="sm" {...messages[intent]} />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Sizes" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={sizes}>
      {#snippet cell(size)}
        <Status {size} intent="success" {...messages.success} />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Columns name the level each Status is given; one well down it shows a level lower, stopping at ghost. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Well>
      <Matrix rows={intents} columns={energies}>
        {#snippet cell(intent, energy)}
          <Status
            {intent}
            energy={resolveEnergy(energy, energies, 1)}
            size="sm"
            {...messages[intent]}
          />
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>

<!-- Columns name the main action's intent: of another intent it glazes, of the box's own it sits on the deep glaze. The second action is ghost neutral at every level. -->
<Story name="Parts" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies} columns={mainIntents}>
      {#snippet cell(energy, main)}
        <Status
          intent="danger"
          {energy}
          size="sm"
          eyebrow="ERROR 500"
          {...messages.danger}
        >
          {#snippet actions()}
            <Button size="sm" intent={main}>Try again</Button>
            <Button size="sm" energy="0" intent="neutral">
              Contact support
            </Button>
          {/snippet}
        </Status>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Loading is the neutral intent with a Spinner icon and pulse, never an intent of its own. -->
<Story name="Loading" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Status
      energy="0"
      pulse
      title="Verifying your domain…"
      body="This usually takes less than a minute."
    >
      {#snippet icon()}
        <Spinner class="size-full" />
      {/snippet}
    </Status>
  {/snippet}
</Story>

<!-- A Status that is the whole page's content is ghost, and so are its actions. -->
<Story name="Action layouts" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={actionsLayouts}>
      {#snippet cell(actionsLayout)}
        <Status
          class="w-[400px]"
          intent="danger"
          energy="0"
          eyebrow="ERROR 500"
          {actionsLayout}
          {...messages.danger}
        >
          {#snippet actions()}
            <Button>Try again</Button>
            <Button energy="0" intent="neutral">Contact support</Button>
          {/snippet}
        </Status>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
