<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Button from "../button/button.svelte";
import Icon from "../icon/icon.svelte";
import Link from "../link/link.svelte";
import ListItem from "../list-item/list-item.svelte";
import Stack from "../stack/stack.svelte";
import Popover from "./popover.svelte";

const owners = [
  { id: "jana", name: "Jana Nováková", role: "Beneficial owner · 60 %" },
  {
    id: "interzone",
    name: "Interzone Holding a.s.",
    role: "Shareholder · 40 %",
  },
];

const sizes = ["sm", "md", "lg"] as const;
const sides = ["top", "right", "bottom", "left"] as const;
const aligns = ["start", "center", "end"] as const;
const titles = ["title", "no title"] as const;
const footers = ["no footer", "footer"] as const;

// bits-ui's prop types slip every HTML attribute past the docgen filter.
const ownProps = ["title", "size", "side", "align", "open"];
// The docs table also lists the snippets and callbacks, which make no useful controls.
const documentedProps = [
  ...ownProps,
  "sideOffset",
  "onOpenChange",
  "trigger",
  "children",
  "footer",
];

// Several panels stay open side by side, so none of them takes the focus.
const staysOpen = {
  open: true,
  trapFocus: false,
  onOpenAutoFocus: (event: Event) => event.preventDefault(),
};

// The panel is portalled, so each cell reserves its width and height.
const widths = { sm: "w-64", md: "w-80", lg: "w-100" } as const;

const { Story } = defineMeta({
  title: "Overlays/Popover",
  component: Popover,
  parameters: {
    docs: {
      description: {
        component:
          "Panel that opens on click beside its trigger, with an optional title, close button and footer, built on bits-ui Popover.",
      },
      controls: { include: documentedProps },
    },
    controls: { include: ownProps },
  },
  args: {
    title: "AML: 2 things owed",
    size: "md",
    side: "bottom",
    align: "start",
    open: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: sizes },
    side: { control: "select", options: sides },
    align: { control: "inline-radio", options: aligns },
  },
});
</script>

<script lang="ts">
const cards: Record<string, HTMLElement> = $state({});
</script>

<!-- Click a trigger to open its popover. -->

<Story name="Playground">
  {#snippet template(args)}
    <Popover {...args}>
      {#snippet trigger({ props })}
        <Button {...props} variant="outline" intent="neutral" size="sm">
          AML
        </Button>
      {/snippet}
      Two owners still need a verified identity before the AML check can pass.
    </Popover>
  {/snippet}
</Story>

<Story name="Sizes" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={sizes}>
      {#snippet cell(size)}
        <div class={[widths[size], "h-52"]}>
          <Popover {size} title="Beneficial owner" {...staysOpen}>
            {#snippet trigger({ props })}
              <Button {...props} variant="outline" intent="neutral" size="sm">
                Open {size}
              </Button>
            {/snippet}
            The natural person who ultimately owns or controls a company, even
            through a chain of other entities.
          </Popover>
        </div>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Optional parts" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    {#snippet checklist()}
      <Button size="sm" variant="soft" intent="neutral">Open checklist</Button>
    {/snippet}
    <Matrix rows={titles} columns={footers}>
      {#snippet cell(titled, withFooter)}
        <div class="h-56 w-80">
          <Popover
            title={titled === "title" ? "AML: 2 things owed" : undefined}
            footer={withFooter === "footer" ? checklist : undefined}
            {...staysOpen}
          >
            {#snippet trigger({ props })}
              <Button {...props} variant="outline" intent="neutral" size="sm">
                AML
              </Button>
            {/snippet}
            Two owners still need a verified identity before the AML check can
            pass.
          </Popover>
        </div>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Blockers" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Popover title="AML: 2 things owed">
      {#snippet trigger({ props })}
        <Button {...props} variant="soft" intent="warning" size="sm">
          {#snippet leadingIcon()}<Icon glyph="warning" />{/snippet}
          AML
        </Button>
      {/snippet}
      <!-- The body is layout-neutral, so the list spaces its own rows. -->
      <Stack as="ul" gap="sm">
        <li><Link href="#jana">Jana Nováková: verify identity</Link></li>
        <li><Link href="#holding">Interzone Holding a.s.: add the deed</Link></li>
      </Stack>
      {#snippet footer()}
        <Button size="sm" variant="soft" intent="neutral">Open checklist</Button>
      {/snippet}
    </Popover>
  {/snippet}
</Story>

<Story name="Field help" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Popover size="sm" side="right" align="center">
      {#snippet trigger({ props })}
        <Button
          {...props}
          variant="ghost"
          intent="neutral"
          size="sm"
          aria-label="About the share"
        >
          {#snippet leadingIcon()}<Icon glyph="help" />{/snippet}
        </Button>
      {/snippet}
      The share of the registered capital, as the commercial register records it.
    </Popover>
  {/snippet}
</Story>

<!-- A pick closes it with returnFocus: false and takes the focus to the owner picked, where Escape or the cross would return it to the trigger. -->
<Story name="Closing on a pick" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-80 flex-col items-start gap-3">
      <Popover title="Find an owner">
        {#snippet trigger({ props })}
          <Button {...props} variant="outline" intent="neutral" size="sm">
            Find an owner
          </Button>
        {/snippet}
        {#snippet children({ close })}
          <!-- Room for the rows' hover tint, which bleeds past them. -->
          <ul class="flex flex-col gap-6 py-2 pe-2">
            {#each owners as owner (owner.id)}
              <li>
                <ListItem
                  title={owner.name}
                  meta={owner.role}
                  onclick={() => {
                    close({ returnFocus: false });
                    cards[owner.id]?.focus();
                  }}
                />
              </li>
            {/each}
          </ul>
        {/snippet}
      </Popover>
      {#each owners as owner (owner.id)}
        <div
          bind:this={cards[owner.id]}
          tabindex="-1"
          class="w-full rounded-xl border border-border-subtle p-4 outline-hidden focus:border-border-focus"
        >
          <p class="text-sm leading-5 font-medium text-fg">{owner.name}</p>
          <p class="text-[13px] leading-5 text-muted-fg">{owner.role}</p>
        </div>
      {/each}
    </div>
  {/snippet}
</Story>
