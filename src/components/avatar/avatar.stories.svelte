<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Avatar from "./avatar.svelte";

const variants = ["mono", "duo"] as const;
const shapes = ["circle", "square"] as const;
const sizes = ["xs", "sm", "md", "lg"] as const;

const JANE = "4f1c0b5a-2d38-4e77-9a61-8c0d3e5f7a92";

const accounts: Record<string, { name: string; organization?: string }> = {
  [JANE]: { name: "Jane Novak" },
  "0f8b1d24-6c3a-4e59-9b07-2d4a6f8c1e30": { name: "Jane Novak" },
  "7c2d5e93-8a41-4b06-9d7f-1e3a5c7b9d02": { name: "Sofia Marín" },
  "3a9e4c17-5d02-4f8b-91c6-7e0b2a4d6f81": {
    name: "Meridian Holdings",
    organization: "Meridian Holdings",
  },
  "b41f7a86-2e59-4c03-8d1b-6a9c0e2f4b73": {
    name: "Interzone",
    organization: "Interzone",
  },
};

const { Story } = defineMeta({
  title: "Data display/Avatar",
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          "Identifies an account by its initials on a gradient field generated from its userId.",
      },
    },
  },
  args: { name: "Jane Novak", userId: JANE, variant: "duo", size: "md" },
  argTypes: {
    variant: { control: "inline-radio", options: variants },
    size: { control: "inline-radio", options: sizes },
    shape: { control: "inline-radio", options: shapes },
  },
});
</script>

<Story name="Playground" />

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={variants} columns={sizes}>
      {#snippet cell(variant, size)}
        <Avatar name="Jane Novak" userId={JANE} {variant} {size} />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Shapes" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={shapes} columns={sizes}>
      {#snippet cell(shape, size)}
        <Avatar name="Jane Novak" userId={JANE} variant="duo" {shape} {size} />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- The field hashes the userId alone, so the two Jane Novaks draw differently. Organizations are square. -->
<Story name="Field per userId" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={Object.keys(accounts)}>
      {#snippet cell(userId)}
        <div class="flex items-center gap-3">
          <Avatar {...accounts[userId]} {userId} variant="duo" size="sm" />
          <span class="text-sm text-fg">{accounts[userId].name}</span>
        </div>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
