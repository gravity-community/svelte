<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Button from "../button/button.svelte";
import Field from "../field/field.svelte";
import Input from "../input/input.svelte";
import SidePanel from "../side-panel/side-panel.svelte";
import Stack from "../stack/stack.svelte";
import StepList from "./step-list.svelte";
import type { StepListStatus, StepListStep } from "./types.ts";

const statuses = [
  "done",
  "current",
  "waiting",
  "blocked",
] as const satisfies readonly StepListStatus[];
const openings = ["closed", "open"] as const;

const onboarding: StepListStep[] = [
  {
    title: "Company details",
    meta: "Northwind Ltd · 04512839",
    status: "done",
  },
  {
    title: "Contact person",
    meta: "Elena Novak · elena@northwind.example",
    status: "done",
  },
  { title: "Bank account", meta: "Where payouts go", status: "current" },
  { title: "Documents", meta: "After Bank account", status: "waiting" },
  { title: "Review", meta: "Can't be done yet", status: "blocked" },
];

const notes: Record<string, string> = {
  "Company details": "Registered in London under 04512839.",
  "Contact person": "Elena receives every notice about this account.",
  "Bank account": "Payouts go to this account every Monday.",
  Documents: "Opens once the bank account is in.",
  Review: "Can't start while a document is missing.",
};

const stepIn = (status: StepListStatus) =>
  onboarding.find((step) => step.status === status)!;

// bits-ui's prop types slip every HTML attribute past the docgen filter.
const ownProps = [
  "steps",
  "content",
  "value",
  "collapsible",
  "onValueChange",
  "loop",
];

const { Story } = defineMeta({
  title: "Navigation/StepList",
  component: StepList,
  parameters: {
    docs: {
      description: {
        component:
          "A task's steps in order, each done, current, waiting or blocked, that open one at a time to show their content, built on bits-ui Accordion.",
      },
      controls: { include: ownProps },
    },
    controls: { include: ownProps },
  },
  args: { steps: onboarding, value: "Bank account", collapsible: true },
});
</script>

<script lang="ts">
let open = $state("Bank account");
</script>

{#snippet note(step: StepListStep)}
  {notes[step.title]}
{/snippet}

<Story name="Playground">
  {#snippet template(args)}
    <StepList {...args} content={note} class="w-[400px]" />
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={statuses} columns={openings}>
      {#snippet cell(status, opening)}
        {@const step = stepIn(status)}
        <StepList
          steps={[step]}
          value={opening === "open" ? step.title : ""}
          content={note}
          class="w-[320px]"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- When something acts on the open step, one stays open: its header has no minus, and opening another is the way on. -->
<Story name="One step always open" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <StepList
      steps={onboarding}
      value="Bank account"
      collapsible={false}
      content={note}
      class="w-[400px]"
    />
  {/snippet}
</Story>

<!-- The main use: a docked panel walks through a task, its footer commits the open step. -->
<Story name="In a side panel" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div
      class="flex h-[720px] w-[860px] overflow-hidden rounded-xl border border-border-subtle"
    >
      <div class="flex-1 bg-page-subtle"></div>
      <SidePanel
        title="Northwind Ltd"
        subtitle="Business account · onboarding"
        size="lg"
      >
        <StepList steps={onboarding} bind:value={open}>
          {#snippet content(step)}
            {#if step.status === "current"}
              <Stack gap="md">
                <Field label="IBAN" for="step-list-iban">
                  <Input
                    id="step-list-iban"
                    variant="tinted"
                    placeholder="GB33 BUKB 2020 1555 5555 55"
                    class="w-full"
                  />
                </Field>
                <Field label="Account holder" for="step-list-holder">
                  <Input
                    id="step-list-holder"
                    variant="tinted"
                    value="Northwind Ltd"
                    class="w-full"
                  />
                </Field>
              </Stack>
            {:else}
              {@render note(step)}
            {/if}
          {/snippet}
        </StepList>
        {#snippet footer()}
          <Button size="sm">Continue</Button>
        {/snippet}
      </SidePanel>
    </div>
  {/snippet}
</Story>
