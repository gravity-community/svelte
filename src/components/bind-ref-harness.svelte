<script lang="ts">
import {
  Checkbox,
  Collapsible,
  GlossaryTerm,
  InputOtp,
  Link,
  SegmentedControl,
  Select,
  Separator,
  StepList,
  Tab,
  VerdictActions,
} from "@gravity-community/svelte";

// A literal bind:ref per wrapper, so svelte-check also fails if one stops being bindable.
let { name, ref = $bindable(null) }: {
  name:
    | "Checkbox"
    | "Collapsible"
    | "GlossaryTerm"
    | "InputOtp"
    | "Link"
    | "SegmentedControl"
    | "SegmentedControl links"
    | "Select"
    | "Separator"
    | "StepList"
    | "Tab"
    | "VerdictActions";
  ref?: HTMLElement | null;
} = $props();
</script>

{#if name === "Checkbox"}
  <Checkbox bind:ref />
{:else if name === "Collapsible"}
  <Collapsible bind:ref title="Scope">Details</Collapsible>
{:else if name === "GlossaryTerm"}
  <GlossaryTerm bind:ref term="UBO" definition="Ultimate beneficial owner." />
{:else if name === "InputOtp"}
  <InputOtp bind:ref format="3-3" />
{:else if name === "Link"}
  <Link bind:ref href="/docs">Docs</Link>
{:else if name === "SegmentedControl"}
  <SegmentedControl bind:ref items={[{ label: "UI" }]} />
{:else if name === "SegmentedControl links"}
  <SegmentedControl bind:ref items={[{ label: "UI", href: "?view=ui" }]} />
{:else if name === "Select"}
  <Select bind:ref items={[{ value: "cz", label: "Czechia" }]} />
{:else if name === "Separator"}
  <Separator bind:ref />
{:else if name === "StepList"}
  <StepList bind:ref steps={[{ title: "Scope", status: "current" }]}>
    {#snippet content()}Details{/snippet}
  </StepList>
{:else if name === "Tab"}
  <Tab bind:ref>Overview</Tab>
{:else if name === "VerdictActions"}
  <VerdictActions bind:ref />
{/if}
