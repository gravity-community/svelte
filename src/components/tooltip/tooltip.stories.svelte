<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Button from "../button/button.svelte";
import Icon from "../icon/icon.svelte";
import Tooltip from "./tooltip.svelte";

const sides = ["top", "right", "bottom", "left"] as const;

// bits-ui's prop types slip every HTML attribute past the docgen filter.
const ownProps = ["label", "shortcut", "side", "open"];
// The docs table also lists the timing, callback and trigger, which make no useful controls.
const documentedProps = [
  ...ownProps,
  "sideOffset",
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
          "Names a control on hover and keyboard focus, with an optional shortcut, built on bits-ui Tooltip.",
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

<!-- Hover or tab to a trigger to show its tooltip. -->

<Story name="Playground">
  {#snippet template(args)}
    <Tooltip {...args}>
      {#snippet trigger({ props })}
        <Button
          {...props}
          variant="ghost"
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
            variant="ghost"
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
