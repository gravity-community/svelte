<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Avatar from "../avatar/avatar.svelte";
import Badge from "../badge/badge.svelte";
import Button from "../button/button.svelte";
import Dot from "../dot/dot.svelte";
import Icon from "../icon/icon.svelte";
import IconCircle from "../icon-circle/icon-circle.svelte";
import ListItem from "./list-item.svelte";

const intents = ["neutral", "danger"] as const;
const tints = ["none", ...intents] as const;
const types = ["default", "data"] as const;

const LONG_TITLE =
  "Submission received — SUB-9F3K-2Q9D is waiting for a verifier";

const { Story } = defineMeta({
  title: "Data display/ListItem",
  component: ListItem,
  parameters: {
    docs: {
      description: {
        component:
          "A list row: a title with optional leading media, meta, detail, badge and actions, or a label–value data row; a whole row can be a link or a button.",
      },
    },
  },
  args: {
    title: "Interzone Inc.",
    meta: "8 subjects · resolved Mar 12, 2026",
    detail: "Dec 16, 2023",
    intent: "neutral",
    tint: false,
    data: false,
    wrap: false,
    tightLeading: false,
  },
  argTypes: {
    title: { control: "text" },
    meta: { control: "text" },
    detail: { control: "text" },
    intent: { control: "inline-radio", options: intents },
  },
});
</script>

<script lang="ts">
let confirming = $state(false);
let opened = $state("none");
</script>

{#snippet documentCircle()}
  <IconCircle>
  <Icon glyph="document" class="size-full" />
</IconCircle>
{/snippet}

<Story name="Playground">
  {#snippet template(args)}
    <ListItem {...args} leading={documentCircle} class="w-[480px]" />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={tints} columns={types}>
      {#snippet cell(tint, type)}
        <!-- Room for the tint, which bleeds past the row. -->
        <div class="py-3 ps-3 pe-6">
          {#if type === "data"}
            <ListItem
              data
              title="Registered office"
              detail="Na Příkopě 859/22, Praha 1"
              tint={tint !== "none"}
              intent={tint === "danger" ? "danger" : "neutral"}
            />
          {:else}
            <ListItem
              title="Interzone Inc."
              meta="8 subjects · resolved Mar 12, 2026"
              detail="Dec 16, 2023"
              leading={documentCircle}
              tint={tint !== "none"}
              intent={tint === "danger" ? "danger" : "neutral"}
            />
          {/if}
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
        leading={documentCircle}
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
          <Button variant="ghost" intent="neutral" size="sm">Resend</Button>
          <Button variant="ghost" intent="danger" size="sm">Revoke</Button>
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
        leading={documentCircle}
      />
      <ListItem
        href="#meridian"
        title="Meridian Holdings"
        meta="3 subjects · resolved Feb 2, 2026"
        detail="Jan 9, 2024"
        leading={documentCircle}
      />
      <ListItem
        href="#northwind"
        title="Northwind Capital"
        meta="5 subjects · in review"
        leading={documentCircle}
      >
        {#snippet actions()}
          <Button variant="ghost" intent="neutral" size="sm">Export</Button>
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
        leading={documentCircle}
        onclick={() => (opened = "Interzone Inc.")}
      />
      <ListItem
        title="Meridian Holdings"
        meta="3 subjects · resolved Feb 2, 2026"
        detail="Jan 9, 2024"
        leading={documentCircle}
        onclick={() => (opened = "Meridian Holdings")}
      />
      <ListItem
        title="Northwind Capital"
        meta="5 subjects · in review"
        leading={documentCircle}
        onclick={() => (opened = "Northwind Capital")}
      >
        {#snippet actions()}
          <Button variant="ghost" intent="neutral" size="sm">Export</Button>
        {/snippet}
      </ListItem>
      <p class="text-[13px] leading-5 text-muted-fg">Last opened: {opened}</p>
    </div>
  {/snippet}
</Story>

<!-- Press Delete to arm the row; Escape or a press outside the tint calls ondismiss. -->
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
            variant="ghost"
            intent="neutral"
            size="sm"
            onclick={() => (confirming = false)}
          >
            Cancel
          </Button>
          <Button
            intent="danger"
            size="sm"
            onclick={() => (confirming = false)}
          >
            Delete
          </Button>
        {:else}
          <Button
            variant="outline"
            intent="danger"
            size="sm"
            onclick={() => (confirming = true)}
          >
            Delete
          </Button>
        {/if}
      {/snippet}
    </ListItem>
  {/snippet}
</Story>
