<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Icon from "../icon/icon.svelte";
import Tab from "../tab/tab.svelte";
import Tabs from "./tabs.svelte";

const states = ["default", "active", "disabled", "with icon"] as const;

const { Story } = defineMeta({
  title: "Navigation/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "Row of route links between the sections of a page, each Tab built on bits-ui Button.",
      },
    },
  },
  args: { "aria-label": "Sections" },
});
</script>

{#snippet users()}
  <Icon glyph="users" class="size-full" />
{/snippet}

<Story name="Playground">
  {#snippet template(args)}
    <Tabs {...args} class="w-[520px]">
      <Tab href="#overview" active>Overview</Tab>
      <Tab href="#members">Members</Tab>
      <Tab href="#documents">Documents</Tab>
      <Tab href="#billing" disabled>Billing</Tab>
    </Tabs>
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states}>
      {#snippet cell(state)}
        <Tab
          href="#members"
          active={state === "active"}
          disabled={state === "disabled"}
          icon={state === "with icon" ? users : undefined}
        >
          Members
        </Tab>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- A row wider than its bar scrolls sideways rather than widening the page. -->
<Story name="Overflow" parameters={{ controls: { disable: true } }}>
  {#snippet template(args)}
    <Tabs {...args} class="w-[280px]">
      <Tab href="#overview" active>Overview</Tab>
      <Tab href="#members">Members</Tab>
      <Tab href="#documents">Documents</Tab>
      <Tab href="#records">Records</Tab>
      <Tab href="#history">History</Tab>
    </Tabs>
  {/snippet}
</Story>
