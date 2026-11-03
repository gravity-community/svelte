<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy } from "../../utils/energy.ts";
import Avatar from "../avatar/avatar.svelte";
import Badge from "../badge/badge.svelte";
import Button from "../button/button.svelte";
import Dot from "../dot/dot.svelte";
import Icon from "../icon/icon.svelte";
import IconCircle from "../icon-circle/icon-circle.svelte";
import ListItem from "./list-item.svelte";
import type { ListItemStatus } from "./types.ts";

const energies = ["2", "1", "0"] as const;
const intents = ["neutral", "danger"] as const;
const tints = ["none", ...intents] as const;
const parts = ["plain", "leading", "badge", "actions"] as const;

const LONG_TITLE =
  "Submission received — SUB-9F3K-2Q9D is waiting for a verifier";

const records = [
  {
    title: "Interzone s.r.o.",
    meta: "03 Structure · 4 left to do",
    detail: "Today 10:42",
    status: { intent: "neutral" },
  },
  {
    title: "Meridian Holdings a.s.",
    meta: "New work · 2 norms changed",
    detail: "Yesterday",
    status: { intent: "info", filled: true },
  },
  {
    title: "Northwind Capital s.r.o.",
    meta: "06 Review · TXP can certify it",
    detail: "Nov 12",
    status: { intent: "success", filled: true },
  },
  {
    title: "Vltava Trade s.r.o.",
    meta: "04 Evidence · 1 document expires soon",
    detail: "Nov 10",
    status: { intent: "warning", filled: true },
  },
  {
    title: "Karlín Invest a.s.",
    meta: "04 Evidence · 1 document refused",
    detail: "Nov 3",
    status: { intent: "danger", filled: true },
  },
] satisfies {
  title: string;
  meta: string;
  detail: string;
  status: ListItemStatus;
}[];

const { Story } = defineMeta({
  title: "Data display/ListItem",
  component: ListItem,
  parameters: {
    docs: {
      description: {
        component:
          "A list row: a title with optional leading media, meta, status dot, detail, badge and actions, or a label–value data row; a whole row can be a link or a button.",
      },
    },
  },
  args: {
    energy: "0",
    title: "Interzone Inc.",
    meta: "8 subjects · resolved Mar 12, 2026",
    status: { intent: "success", filled: true, label: "Verified" },
    detail: "Dec 16, 2023",
    intent: "neutral",
    tint: false,
    data: false,
    wrap: false,
    tightLeading: false,
  },
  argTypes: {
    energy: { control: "inline-radio", options: energies },
    title: { control: "text" },
    meta: { control: "text" },
    status: { control: "object" },
    detail: { control: "text" },
    intent: { control: "inline-radio", options: intents },
  },
});
</script>

<script lang="ts">
let confirming = $state(false);
let opened = $state("none");
</script>

{#snippet thumbnail()}
  <span class="h-12 w-16 rounded-lg bg-well"></span>
{/snippet}

<!-- Parts set no energy: they match the row, and its actions sit one level lower. -->
{#snippet document()}
  <IconCircle>
  <Icon glyph="document" class="size-full" />
</IconCircle>
{/snippet}

{#snippet verified()}
  <Badge intent="success" dot>Verified</Badge>
{/snippet}

{#snippet action()}
  <Button size="sm">Open</Button>
{/snippet}

<Story name="Playground">
  {#snippet template(args)}
    <ListItem {...args} leading={document} class="w-[480px]" />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies} columns={parts}>
      {#snippet cell(energy, part)}
        <!-- Room for the tint, which bleeds past the row. -->
        <div class="w-72 py-3 ps-3 pe-6">
          <ListItem
            {energy}
            title="Interzone Inc."
            meta="8 subjects"
            detail={part === "plain" ? "Dec 16, 2023" : undefined}
            leading={part === "leading" ? document : undefined}
            badge={part === "badge" ? verified : undefined}
            actions={part === "actions" ? action : undefined}
          />
        </div>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- A tint holds the row: a soft row's fill deepens, a faint or ghost row fills with the well, and a danger row holds in its own tint. -->
<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={tints} columns={energies}>
      {#snippet cell(tint, energy)}
        <div class="w-80 py-3 ps-3 pe-6">
          <ListItem
            {energy}
            title="Interzone Inc."
            meta="8 subjects · resolved Mar 12, 2026"
            leading={document}
            tint={tint !== "none"}
            intent={tint === "danger" ? "danger" : "neutral"}
          />
        </div>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Rows are the level each row is given; inside a filled well it shows one level lower, passed by hand, and its parts follow. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Well>
      <Matrix rows={energies}>
        {#snippet cell(energy)}
          <div class="w-[400px] py-3 ps-3 pe-6">
            <ListItem
              energy={resolveEnergy(energy, energies, 1)}
              title="Interzone Inc."
              meta="8 subjects"
              leading={document}
              badge={verified}
              actions={action}
            />
          </div>
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>

<!-- The leading IconCircle and the Badge match the row, the action sits one level lower, and at every level the quiet More stays ghost neutral and the status dot keeps its colours. -->
<Story name="Parts" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies}>
      {#snippet cell(energy)}
        <div class="w-[560px] py-3 ps-3 pe-6">
          <ListItem
            {energy}
            title="Interzone Inc."
            meta="8 subjects · resolved Mar 12, 2026"
            status={{ intent: "success", filled: true }}
            leading={document}
            badge={verified}
          >
            {#snippet actions()}
              <Button size="sm">Open</Button>
              <Button energy="0" intent="neutral" size="sm" aria-label="More">
                {#snippet leadingIcon()}<Icon glyph="dots" />{/snippet}
              </Button>
            {/snippet}
          </ListItem>
        </div>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Plain" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-[400px] flex-col gap-6">
      <ListItem title="Quarterly filing" />
      <ListItem title="Quarterly filing" meta="Due Jul 31, 2026" detail="Draft" />
      <ListItem title={LONG_TITLE} detail="Jun 28, 2026" />
      <ListItem title={LONG_TITLE} detail="Jun 28, 2026" wrap />
    </div>
  {/snippet}
</Story>

<Story name="With leading" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-[480px] flex-col gap-6">
      <ListItem
        title="Certificate of incorporation.pdf"
        meta="PDF · 2.4 MB · uploaded May 20, 2026"
        leading={document}
      />
      <ListItem
        title="jane.novak@registry.example.com"
        meta="Invited 2 days ago"
      >
        {#snippet leading()}
          <IconCircle><Icon glyph="mail" class="size-full" /></IconCircle>
        {/snippet}
        {#snippet badge()}
          <Badge intent="info">Invited</Badge>
        {/snippet}
        {#snippet actions()}
          <Button intent="neutral" size="sm">Resend</Button>
          <Button intent="danger" size="sm">Revoke</Button>
        {/snippet}
      </ListItem>
      <ListItem title="Ada Lovelace" meta="Verifier" detail="2 min ago">
        {#snippet leading()}
          <Avatar
            name="Ada Lovelace"
            userId="0f8b1d24-6c3a-4e59-9b07-2d4a6f8c1e30"
            variant="duo"
          />
        {/snippet}
      </ListItem>
      <ListItem
        title="New message from the verifier"
        meta="2 min ago"
        tightLeading
      >
        {#snippet leading()}
          <Dot intent="info" filled />
        {/snippet}
      </ListItem>
    </div>
  {/snippet}
</Story>

<!-- Most metas say what their dot means and pass no label; Brněnská strojírna's doesn't, so its label is announced first ("Ready, 04 Evidence · 6 documents"). At phone width the dot stays on the meta's first line. -->
<Story name="With status" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex flex-col gap-12">
      <div class="flex w-[480px] flex-col gap-6">
        {#each records as record (record.title)}
          <ListItem href="#record" {...record} leading={thumbnail} />
        {/each}
        <ListItem
          href="#record"
          title="Brněnská strojírna a.s."
          meta="04 Evidence · 6 documents"
          status={{ intent: "success", filled: true, label: "Ready" }}
          detail="Oct 28"
          leading={thumbnail}
        />
      </div>
      <div class="w-[343px]">
        <ListItem
          href="#record"
          title="Interzone s.r.o."
          meta="03 Structure · 4 left to do · 2 owners not yet verified"
          status={{ intent: "neutral" }}
          detail="Today 10:42"
          leading={thumbnail}
        />
      </div>
    </div>
  {/snippet}
</Story>

<Story name="Data rows" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-[344px] flex-col gap-3">
      <ListItem
        data
        title="Registered office"
        detail="Na Příkopě 859/22, Praha 1"
      />
      <ListItem
        data
        title="Business activities"
        detail="Production, trade and services not listed in Annexes 1 to 3 of the Trade Licensing Act"
      />
      <ListItem data title="Contact" detail="Elena Nováková" />
      <ListItem data title="Email" detail="ops@northwind.example" />
      <ListItem data title="Signing key">
        {#snippet detail()}
          <span class="font-mono">SHA256:tR4mNp8Q…7hXe</span>
        {/snippet}
      </ListItem>
      <ListItem data title="Phone" />
    </div>
  {/snippet}
</Story>

<!-- Hover a row: the whole row is the link, and its actions stay clickable above it. -->
<Story name="Links" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-[480px] flex-col gap-6">
      <ListItem
        href="#interzone"
        title="Interzone Inc."
        meta="8 subjects · resolved Mar 12, 2026"
        detail="Dec 16, 2023"
        leading={document}
      />
      <ListItem
        href="#meridian"
        title="Meridian Holdings"
        meta="3 subjects · resolved Feb 2, 2026"
        detail="Jan 9, 2024"
        leading={document}
      />
      <ListItem
        href="#northwind"
        title="Northwind Capital"
        meta="5 subjects · in review"
        leading={document}
      >
        {#snippet actions()}
          <Button intent="neutral" size="sm">Export</Button>
        {/snippet}
      </ListItem>
    </div>
  {/snippet}
</Story>

<!-- Hover a row: the whole row is one button, named by its title, and its actions stay clickable above it. -->
<Story name="Buttons" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-[480px] flex-col gap-6">
      <ListItem
        title="Interzone Inc."
        meta="8 subjects · resolved Mar 12, 2026"
        detail="Dec 16, 2023"
        leading={document}
        onclick={() => (opened = "Interzone Inc.")}
      />
      <ListItem
        title="Meridian Holdings"
        meta="3 subjects · resolved Feb 2, 2026"
        detail="Jan 9, 2024"
        leading={document}
        onclick={() => (opened = "Meridian Holdings")}
      />
      <ListItem
        title="Northwind Capital"
        meta="5 subjects · in review"
        leading={document}
        onclick={() => (opened = "Northwind Capital")}
      >
        {#snippet actions()}
          <Button intent="neutral" size="sm">Export</Button>
        {/snippet}
      </ListItem>
      <p class="text-[13px] leading-5 text-muted-fg">Last opened: {opened}</p>
    </div>
  {/snippet}
</Story>

<!-- Press Delete to arm the row; Escape or a press outside the tint calls ondismiss. Armed, the Delete is raised to soft by an absolute level and Cancel is written quiet. -->
<Story name="Inline confirmation" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <ListItem
      title="Delete workspace"
      meta="This can't be undone."
      intent="danger"
      tint={confirming}
      ondismiss={() => (confirming = false)}
      class="w-[480px]"
    >
      {#snippet actions()}
        {#if confirming}
          <Button
            energy="0"
            intent="neutral"
            size="sm"
            onclick={() => (confirming = false)}
          >
            Cancel
          </Button>
          <Button
            energy="2"
            intent="danger"
            size="sm"
            onclick={() => (confirming = false)}
          >
            Delete
          </Button>
        {:else}
          <Button intent="danger" size="sm" onclick={() => (confirming = true)}>
            Delete
          </Button>
        {/if}
      {/snippet}
    </ListItem>
  {/snippet}
</Story>
