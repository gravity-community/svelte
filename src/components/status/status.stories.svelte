<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Button from "../button/button.svelte";
import Spinner from "../spinner/spinner.svelte";
import Status from "./status.svelte";

const intents = ["neutral", "info", "success", "warning", "danger"] as const;
const sizes = ["sm", "md", "lg"] as const;
const variants = ["plain", "card"] as const;
const actionsLayouts = ["inline", "stretch"] as const;

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
    size: "md",
    variant: "plain",
    pulse: false,
    actionsLayout: "inline",
    ...messages.neutral,
  },
  argTypes: {
    intent: { control: "select", options: intents },
    size: { control: "inline-radio", options: sizes },
    variant: { control: "inline-radio", options: variants },
    actionsLayout: { control: "inline-radio", options: actionsLayouts },
    eyebrow: { control: "text" },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Status {...args}>
      {#snippet actions()}
        <Button size={args.size}>Create record</Button>
        <Button size={args.size} variant="ghost" intent="neutral">Import</Button>
      {/snippet}
    </Status>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents} columns={variants}>
      {#snippet cell(intent, variant)}
        <Status {intent} {variant} size="sm" {...messages[intent]} />
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

<!-- Loading is the neutral intent with a Spinner icon and pulse, never an intent of its own. -->
<Story name="Loading" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Status
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

<Story name="Action layouts" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={actionsLayouts}>
      {#snippet cell(actionsLayout)}
        <Status
          class="w-[400px]"
          intent="danger"
          eyebrow="ERROR 500"
          {actionsLayout}
          {...messages.danger}
        >
          {#snippet actions()}
            <Button>Try again</Button>
            <Button variant="ghost" intent="neutral">Contact support</Button>
          {/snippet}
        </Status>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
