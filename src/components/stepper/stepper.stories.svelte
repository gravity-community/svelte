<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Stepper from "./stepper.svelte";
import type { StepperStep } from "./types.ts";

const orientations = ["vertical", "horizontal"] as const;

const wizard: StepperStep[] = [
  { label: "The record", href: "#record" },
  { label: "Verified subject", href: "#subject" },
  { label: "Structure", href: "#structure" },
  { label: "Evidence" },
  { label: "Chains & absences" },
  { label: "Certificate" },
];

const states: StepperStep[] = [
  { label: "Done", description: "Before the current step." },
  { label: "Error", description: "Set by the step.", status: "error" },
  { label: "Current", description: 'aria-current="step"' },
  { label: "Upcoming", description: "After the current step." },
];

const { Story } = defineMeta({
  title: "Navigation/Stepper",
  component: Stepper,
  parameters: {
    docs: {
      description: {
        component:
          "Ordered steps of a task, each done, current, upcoming or in error, optionally linking back.",
      },
    },
  },
  args: {
    steps: wizard,
    current: 2,
    orientation: "vertical",
    "aria-label": "Steps",
  },
  argTypes: {
    orientation: { control: "inline-radio", options: orientations },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Stepper {...args} class={args.orientation === "horizontal" ? "w-[880px]" : ""} />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={orientations}>
      {#snippet cell(orientation)}
        <Stepper
          steps={wizard.slice(0, 4)}
          current={2}
          {orientation}
          aria-label="Steps"
          class={orientation === "horizontal" ? "w-[760px]" : ""}
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={orientations}>
      {#snippet cell(orientation)}
        <Stepper
          steps={states}
          current={2}
          {orientation}
          aria-label="Step states"
          class={orientation === "horizontal" ? "w-[760px]" : ""}
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Wizard" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Stepper steps={wizard} current={2} aria-label="Steps" />
  {/snippet}
</Story>
