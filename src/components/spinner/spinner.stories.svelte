<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Spinner from "./spinner.svelte";

const sizes = ["sm", "md", "lg"] as const;

const { Story } = defineMeta({
  title: "Feedback/Spinner",
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          "Indeterminate loading glyph that spins in the current text colour.",
      },
    },
  },
  args: { size: "sm" },
  argTypes: { size: { control: "inline-radio", options: sizes } },
});
</script>

<Story name="Playground" />

<Story name="Sizes" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={sizes}>
      {#snippet cell(size)}
        <Spinner {size} />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Inherits colour" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex flex-col gap-3 text-sm">
      <span class="flex items-center gap-2 text-muted-fg">
        <Spinner /> Saving changes…
      </span>
      <span class="flex items-center gap-2 text-primary-solid">
        <Spinner /> Uploading 3 files…
      </span>
      <span class="flex items-center gap-2 text-danger-strong">
        <Spinner /> Reconnecting…
      </span>
    </div>
  {/snippet}
</Story>
