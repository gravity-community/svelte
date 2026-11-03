<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Button from "../button/button.svelte";
import Icon from "../icon/icon.svelte";
import Tooltip from "./tooltip.svelte";

const sides = ["top", "right", "bottom", "left"] as const;

// bits-ui's prop types slip every HTML attribute past the docgen filter.
const ownProps = ["label", "shortcut", "side", "open"];
// The docs table also lists the spacing, timing, callback and trigger, which make no useful controls.
const documentedProps = [
  ...ownProps,
  "sideOffset",
  "collisionPadding",
  "delayDuration",
  "onOpenChange",
  "trigger",
];

const { Story } = defineMeta({
  title: "Overlays/Tooltip",
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          "Names a control on hover, keyboard focus or, where the control has no action of its own, a tap on touch screens, with an optional shortcut, built on bits-ui Tooltip.",
      },
      controls: { include: documentedProps },
    },
    controls: { include: ownProps },
  },
  args: {
    label: "Find a subject",
    shortcut: "⌘K",
    side: "top",
    open: false,
  },
  argTypes: {
    side: { control: "select", options: sides },
  },
});
</script>

<!-- Hover, tab to or tap a trigger to show its tooltip; a second tap or a tap elsewhere hides it. -->

<Story name="Playground">
  {#snippet template(args)}
    <Tooltip {...args}>
      {#snippet trigger({ props })}
        <Button
          {...props}
          energy="0"
          intent="neutral"
          size="sm"
          aria-label="Find a subject"
        >
          {#snippet leadingIcon()}<Icon glyph="search" />{/snippet}
        </Button>
      {/snippet}
    </Tooltip>
  {/snippet}
</Story>

<!-- Opened by focusing its trigger: a tooltip open before its trigger is laid out can't be positioned. -->
<Story
  name="On an icon button"
  parameters={{
    controls: { disable: true },
    docs: { story: { autoplay: true } },
  }}
  play={({ canvasElement }) => {
    canvasElement.querySelector("button")?.focus({ preventScroll: true });
  }}
>
  {#snippet template()}
    <div class="flex h-24 items-end">
      <Tooltip label="Undo: Add Petr Svoboda" shortcut="⌘Z">
        {#snippet trigger({ props })}
          <Button
            {...props}
            energy="0"
            intent="neutral"
            size="sm"
            aria-label="Undo"
          >
            {#snippet leadingIcon()}<Icon glyph="undo" />{/snippet}
          </Button>
        {/snippet}
      </Tooltip>
    </div>
  {/snippet}
</Story>

<!-- Wraps a long label at its 16rem maximum width, 16px clear of the viewport's edges. On this page, hover the trigger: the story above holds the focus. -->
<Story
  name="Long label"
  parameters={{ controls: { disable: true } }}
  play={({ canvasElement }) => {
    canvasElement.querySelector("button")?.focus({ preventScroll: true });
  }}
>
  {#snippet template()}
    <div class="flex h-28 items-end">
      <Tooltip
        label="This document can't be signed yet because of a technical issue. It will be resolved."
      >
        {#snippet trigger({ props })}
          <Button
            {...props}
            energy="0"
            intent="warning"
            size="sm"
            aria-label="Can't be signed yet"
          >
            {#snippet leadingIcon()}<Icon glyph="warning" />{/snippet}
          </Button>
        {/snippet}
      </Tooltip>
    </div>
  {/snippet}
</Story>
