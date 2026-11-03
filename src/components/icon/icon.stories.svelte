<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Button from "../button/button.svelte";
import { GLYPHS, type IconGlyph } from "./glyphs.ts";
import Icon from "./icon.svelte";

const glyphs = Object.keys(GLYPHS) as IconGlyph[];
const intents = [
  "primary",
  "success",
  "warning",
  "danger",
  "neutral",
  "accent",
] as const;
const indicators = ["count 3", "count 12", "status"] as const;
const counts = { "count 3": 3, "count 12": 12, status: undefined };

const { Story } = defineMeta({
  title: "Foundations/Icons",
  component: Icon,
  parameters: {
    docs: {
      description: {
        component:
          "Decorative SVG glyph from the Figma icon set, drawn in currentColor and sized by class, with an optional count pill or status dot at its top-right corner.",
      },
    },
  },
  args: {
    glyph: "search",
    class: "size-6",
    count: 0,
    countIntent: "primary",
    status: false,
    statusIntent: "primary",
  },
  argTypes: {
    glyph: { control: "select", options: glyphs },
    countIntent: { control: "select", options: intents },
    statusIntent: { control: "select", options: intents },
  },
});
</script>

<Story name="Playground" />

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={intents} columns={indicators}>
      {#snippet cell(intent, indicator)}
        <Icon
          glyph="mail"
          class="size-6"
          count={counts[indicator]}
          countIntent={intent}
          status={indicator === "status"}
          statusIntent={intent}
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story
  name="Gallery"
  parameters={{ layout: "padded", controls: { disable: true } }}
>
  {#snippet template()}
    <div class="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-2">
      {#each glyphs as glyph (glyph)}
        <div
          class="flex flex-col items-center gap-2 rounded-lg border border-border-subtle p-3"
        >
          <Icon {glyph} class="size-6" />
          <span class="font-mono text-xs text-subtle-fg">{glyph}</span>
        </div>
      {/each}
    </div>
  {/snippet}
</Story>

<Story name="In a button" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex items-center gap-1">
      <Button
        variant="ghost"
        intent="neutral"
        size="sm"
        aria-label="Mail: 3 unread"
      >
        {#snippet leadingIcon()}
          <Icon glyph="mail" count={3} countIntent="danger" class="size-full" />
        {/snippet}
      </Button>
      <Button
        variant="ghost"
        intent="neutral"
        size="sm"
        aria-label="Messages: 12 unread"
      >
        {#snippet leadingIcon()}
          <Icon
            glyph="message"
            count={12}
            countIntent="warning"
            class="size-full"
          />
        {/snippet}
      </Button>
      <Button
        variant="ghost"
        intent="neutral"
        size="sm"
        aria-label="Security: verified"
      >
        {#snippet leadingIcon()}
          <Icon
            glyph="shield-check"
            status
            statusIntent="success"
            class="size-full"
          />
        {/snippet}
      </Button>
    </div>
  {/snippet}
</Story>
