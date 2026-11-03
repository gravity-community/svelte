<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import MenuToggle from "./menu-toggle.svelte";

const states = ["closed", "open"] as const;

const { Story } = defineMeta({
  title: "Navigation/MenuToggle",
  component: MenuToggle,
  parameters: {
    docs: {
      description: {
        component:
          "Hamburger button whose bars morph into a close mark while its menu is open.",
      },
    },
  },
  args: { open: false },
});
</script>

<Story name="Playground" />

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states}>
      {#snippet cell(state)}
        <MenuToggle open={state === "open"} />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
