<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import LockRow from "./lock-row.svelte";

const { Story } = defineMeta({
  title: "Data display/LockRow",
  component: LockRow,
  parameters: {
    docs: {
      description: {
        component:
          "Stands in for a field the viewer's access tier hides, naming the access that would reveal it.",
      },
    },
  },
  args: { label: "Available with legitimate-interest access" },
});
</script>

<Story name="Playground" />
