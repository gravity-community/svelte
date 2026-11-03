<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Separator from "./separator.svelte";

const orientations = ["horizontal", "vertical"] as const;

const { Story } = defineMeta({
  title: "Layout/Separator",
  component: Separator,
  parameters: {
    docs: {
      description: {
        component:
          "Hairline rule between groups of content, built on bits-ui Separator.",
      },
    },
  },
  args: { orientation: "horizontal", decorative: false },
  argTypes: {
    orientation: { control: "inline-radio", options: orientations },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <div class="flex h-12 w-64 items-center justify-center">
      <Separator {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={orientations}>
      {#snippet cell(orientation)}
        <div
          class={[
            "flex gap-3 text-sm text-fg",
            orientation === "horizontal" ? "w-48 flex-col" : "h-5 items-center",
          ]}
        >
          <span>Profile</span>
          <Separator {orientation} />
          <span>Billing</span>
        </div>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
