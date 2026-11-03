<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Button from "../button/button.svelte";
import Field from "../field/field.svelte";
import Icon from "../icon/icon.svelte";
import Input from "../input/input.svelte";
import Stack from "../stack/stack.svelte";
import SidePanel from "./side-panel.svelte";

const sides = ["right", "left"] as const;
const sizes = ["md", "lg"] as const;
const parts = ["title only", "subtitle", "actions", "footer"] as const;

const title = "Interzone Holding a.s.";
const subtitle = "Layer 2 › Holders › Holding";

const { Story } = defineMeta({
  title: "Layout/SidePanel",
  component: SidePanel,
  parameters: {
    docs: {
      description: {
        component:
          "Docked, non-modal panel beside the main content, such as an inspector: a header, a scrolling body and an optional footer.",
      },
    },
  },
  args: { title, subtitle, side: "right", size: "md" },
  argTypes: {
    side: { control: "inline-radio", options: sides },
    size: { control: "inline-radio", options: sizes },
  },
});
</script>

<!-- The panel fills its parent's height, so each story docks it in a fixed frame beside a stand-in canvas. -->

{#snippet more()}
  <Button variant="ghost" intent="neutral" size="sm" aria-label="More actions">
    {#snippet leadingIcon()}<Icon glyph="dots" />{/snippet}
  </Button>
{/snippet}

{#snippet cancelSave()}
  <Button size="sm" variant="soft" intent="neutral">Cancel</Button>
  <Button size="sm">Save</Button>
{/snippet}

<Story name="Playground">
  {#snippet template(args)}
    <div
      class={[
        "flex h-[480px] w-[760px] overflow-hidden rounded-xl border border-border-subtle",
        args.side === "left" && "flex-row-reverse",
      ]}
    >
      <div class="flex-1 bg-page-subtle"></div>
      <SidePanel {...args}>
        <p class="text-sm text-muted-fg">
          Select a holding on the canvas to edit it.
        </p>
      </SidePanel>
    </div>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={sides} columns={sizes}>
      {#snippet cell(side, size)}
        <div
          class={[
            "flex h-[320px] overflow-hidden rounded-xl border border-border-subtle",
            side === "left" && "flex-row-reverse",
          ]}
        >
          <div class="w-20 bg-page-subtle"></div>
          <SidePanel
            {title}
            {subtitle}
            {side}
            {size}
            actions={more}
            footer={cancelSave}
          >
            <p class="text-sm text-muted-fg">Body</p>
          </SidePanel>
        </div>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Optional parts" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={parts}>
      {#snippet cell(part)}
        {@const index = parts.indexOf(part)}
        <!-- Each row adds one part to the row above. -->
        <div
          class="flex h-[240px] overflow-hidden rounded-xl border border-border-subtle"
        >
          <div class="w-20 bg-page-subtle"></div>
          <SidePanel
            {title}
            subtitle={index >= 1 ? subtitle : undefined}
            actions={index >= 2 ? more : undefined}
            footer={index >= 3 ? cancelSave : undefined}
          >
            <p class="text-sm text-muted-fg">Body</p>
          </SidePanel>
        </div>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Inspector" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div
      class="flex h-[600px] w-[860px] overflow-hidden rounded-xl border border-border-subtle"
    >
      <div class="flex-1 bg-page-subtle"></div>
      <SidePanel {title} size="lg" actions={more}>
        {#snippet subtitle()}
          <nav aria-label="Breadcrumb">Layer 2 › Holders › Holding</nav>
        {/snippet}
        <!-- The body is layout-neutral, so the fields sit in their own Stack. -->
        <Stack>
          <Field label="Holder" for="holder">
            <Input id="holder" variant="tinted" value={title} class="w-full" />
          </Field>
          <Field label="Share" hint="Of the registered capital." for="share">
            <Input id="share" variant="tinted" value="60 %" class="w-full" />
          </Field>
          <Field label="Since" for="since">
            <Input
              id="since"
              variant="tinted"
              value="12. 3. 2019"
              class="w-full"
            />
          </Field>
          <Field label="IČO" value="064 15 822" />
          <Field label="Seat" value="Brno" />
        </Stack>
        {#snippet footer()}
          <Button size="sm" variant="ghost" intent="danger" class="me-auto">
            Remove
          </Button>
          {@render cancelSave()}
        {/snippet}
      </SidePanel>
    </div>
  {/snippet}
</Story>
