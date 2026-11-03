<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Button from "../button/button.svelte";
import Icon from "../icon/icon.svelte";
import Link from "../link/link.svelte";
import Stack from "../stack/stack.svelte";
import Popover from "./popover.svelte";

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
