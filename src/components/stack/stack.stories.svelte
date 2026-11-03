<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Stack from "./stack.svelte";

const gaps = ["none", "xxs", "sm", "md", "lg", "xl", "2xl"] as const;
const directions = ["column", "row"] as const;

const tile =
  "rounded-lg border border-dashed border-border bg-surface-subtle px-3 py-1 text-center font-mono text-xs text-muted-fg";

const { Story } = defineMeta({
  title: "Layout/Stack",
  component: Stack,
  parameters: {
    docs: {
      description: {
        component:
          "Flex column or row that spaces its children with a spacing token.",
      },
    },
  },
  args: { gap: "lg", direction: "column" },
  argTypes: {
    gap: { control: "select", options: gaps },
    direction: { control: "inline-radio", options: directions },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Stack {...args}>
      <div class={tile}>One</div>
      <div class={tile}>Two</div>
      <div class={tile}>Three</div>
    </Stack>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={gaps} columns={directions}>
      {#snippet cell(gap, direction)}
        <Stack {gap} {direction}>
          <div class={tile}>One</div>
          <div class={tile}>Two</div>
        </Stack>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- lg (16px) separates rows within a section, xl (24px) separates sections. -->
<Story name="Section rhythm" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Stack gap="xl" class="w-[320px]">
      {#each ["Profile", "Notifications"] as section (section)}
        <Stack as="section">
          <div class={tile}>{section} · row 1</div>
          <div class={tile}>{section} · row 2</div>
        </Stack>
      {/each}
    </Stack>
  {/snippet}
</Story>
