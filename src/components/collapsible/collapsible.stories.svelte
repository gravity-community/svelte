<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Button from "../button/button.svelte";
import Icon from "../icon/icon.svelte";
import ListItem from "../list-item/list-item.svelte";
import Collapsible from "./collapsible.svelte";

const states = ["closed", "open"] as const;

const records = [
  {
    title: "Interzone s.r.o.",
    meta: "03 Structure · 4 left to do",
    detail: "Today 10:42",
  },
  {
    title: "Meridian Holdings a.s.",
    meta: "New work · 2 norms changed",
    detail: "Yesterday",
  },
  {
    title: "Northwind Capital s.r.o.",
    meta: "06 Review · TXP can certify it",
    detail: "Nov 12",
  },
  {
    title: "Vltava Trade s.r.o.",
    meta: "04 Evidence · 1 document expires soon",
    detail: "Nov 10",
  },
  {
    title: "Karlín Invest a.s.",
    meta: "04 Evidence · 1 document refused",
    detail: "Nov 3",
  },
  {
    title: "Brněnská strojírna a.s.",
    meta: "04 Evidence · 6 documents",
    detail: "Oct 28",
  },
  {
    title: "Labe Logistics s.r.o.",
    meta: "02 Subject · found in ARES",
    detail: "Oct 21",
  },
  {
    title: "Šumava Energy a.s.",
    meta: "05 Owners · 1 owner to verify",
    detail: "Oct 14",
  },
];

// bits-ui's prop types slip every HTML attribute past the docgen filter.
const ownProps = [
  "title",
  "trigger",
  "open",
  "onOpenChange",
  "onOpenChangeComplete",
  "disabled",
];

const { Story } = defineMeta({
  title: "Data display/Collapsible",
  component: Collapsible,
  parameters: {
    docs: {
      description: {
        component:
          "A section that hides its detail until opened, from its own title row or from the caller's trigger after it, built on bits-ui Collapsible.",
      },
      controls: { include: ownProps },
    },
    controls: { include: ownProps },
  },
  args: { title: "Full access", open: false },
});
</script>

<script lang="ts">
let showAll = $state(false);
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Collapsible {...args} class="w-[480px]">
      Competent authorities and obliged entities see the complete verified
      ownership chain, with the evidence behind every link.
    </Collapsible>
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states}>
      {#snippet cell(state)}
        <Collapsible
          title="Full access"
          open={state === "open"}
          class="w-[480px]"
        >
          Competent authorities and obliged entities see the complete verified
          ownership chain, with the evidence behind every link.
        </Collapsible>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="FAQ" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-[480px] flex-col">
      <Collapsible title="How do I invite a teammate?" open>
        Open Settings, then Members, and enter their work email. The invitation
        stays valid for seven days.
      </Collapsible>
      <Collapsible title="Can I change my plan later?">
        Yes. An upgrade applies straight away; a downgrade takes effect at the
        end of the current billing period.
      </Collapsible>
      <Collapsible title="How do I export my data?">
        Choose Export under Settings, then Data. We email you a download link
        once the archive is ready.
      </Collapsible>
    </div>
  {/snippet}
</Story>

<!-- The trigger is the caller's, after the content: the rows past the third open above it, and it folds them away again. -->
<Story name="Show more" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-[480px] flex-col">
      <ul class="flex flex-col gap-6">
        {#each records.slice(0, 3) as record (record.title)}
          <li><ListItem href="#record" {...record} /></li>
        {/each}
      </ul>
      <Collapsible bind:open={showAll}>
        <ul class="flex flex-col gap-6 pt-6">
          {#each records.slice(3) as record (record.title)}
            <li><ListItem href="#record" {...record} /></li>
          {/each}
        </ul>
        {#snippet trigger({ props })}
          <!-- -ms-3 puts the label on the rows' edge, as their tint bleeds past it. -->
          <Button
            {...props}
            energy="0"
            intent="neutral"
            size="sm"
            class="mt-4 -ms-3"
          >
            {showAll ? "Show fewer" : `Show all ${records.length} records`}
            {#snippet trailingIcon()}
              <Icon
                glyph={showAll ? "chevron-up" : "chevron-down"}
                class="size-full"
              />
            {/snippet}
          </Button>
        {/snippet}
      </Collapsible>
    </div>
  {/snippet}
</Story>
