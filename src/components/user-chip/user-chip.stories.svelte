<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import UserChip from "./user-chip.svelte";

const variants = ["mono", "duo"] as const;

const { Story } = defineMeta({
  title: "Data display/UserChip",
  component: UserChip,
  parameters: {
    docs: {
      description: {
        component: "A compact pill that names an account next to its avatar.",
      },
    },
  },
  args: {
    name: "Alex N.",
    userId: "5e7a9c31-0b64-4d28-8f15-3a6c9e1b7d40",
    variant: "duo",
  },
  argTypes: {
    variant: { control: "inline-radio", options: variants },
  },
});
</script>

<Story name="Playground" />

<Story name="Long name" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="w-40">
      <UserChip
        name="Alexandra Novak-Lindqvist"
        userId="e6a2c840-9b17-4d35-8f0e-3c5b7d9a1f42"
        variant="duo"
      />
    </div>
  {/snippet}
</Story>
