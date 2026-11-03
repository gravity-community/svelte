<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Container from "./container.svelte";

const sizes = ["xs", "sm", "md", "lg", "xl", "full"] as const;

const maxWidths = {
  xs: "max 400px",
  sm: "max 480px",
  md: "max 560px",
  lg: "max 720px",
  xl: "max 960px",
  full: "no max",
} satisfies Record<(typeof sizes)[number], string>;

const tile =
  "rounded-xl border border-dashed border-border bg-surface-subtle p-4 text-center font-mono text-xs text-muted-fg";

const { Story } = defineMeta({
  title: "Layout/Container",
  component: Container,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Centred page column capped at one of the contract widths: xs, sm, md, lg, xl or full.",
      },
    },
  },
  args: { size: "lg" },
  argTypes: { size: { control: "inline-radio", options: sizes } },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Container {...args}>
      <div class={tile}>Page content</div>
    </Container>
  {/snippet}
</Story>

<Story name="Sizes" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex flex-col gap-4">
      {#each sizes as size (size)}
        <Container {size}>
          <div class={tile}>{size} · {maxWidths[size]}</div>
        </Container>
      {/each}
    </div>
  {/snippet}
</Story>
