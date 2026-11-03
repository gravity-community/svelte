<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Kbd from "./kbd.svelte";

const shortcuts = [
  { action: "Find a subject", keys: ["⌘K"] },
  { action: "Undo", keys: ["⌘Z"] },
  { action: "Redo", keys: ["⇧⌘Z"] },
  { action: "Close", keys: ["Esc"] },
  { action: "Move through results", keys: ["↑", "↓"] },
] as const;

const { Story } = defineMeta({
  title: "Typography/Kbd",
  component: Kbd,
  parameters: {
    docs: {
      description: {
        component:
          "Key cap for a keyboard shortcut, as in a shortcuts list or a hint.",
      },
    },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Kbd {...args}>⌘K</Kbd>
  {/snippet}
</Story>

<Story name="Shortcuts" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <dl class="grid w-80 grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3">
      {#each shortcuts as { action, keys } (action)}
        <dt class="text-sm text-muted-fg">{action}</dt>
        <dd class="flex gap-1">
          {#each keys as key (key)}
            <Kbd>{key}</Kbd>
          {/each}
        </dd>
      {/each}
    </dl>
  {/snippet}
</Story>
