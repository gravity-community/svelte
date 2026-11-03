<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";
import VerdictActions from "./verdict-actions.svelte";

// bits-ui's prop types slip every HTML attribute past the docgen filter.
const ownProps = ["onverdict"];

const { Story } = defineMeta({
  title: "Data display/VerdictActions",
  component: VerdictActions,
  parameters: {
    docs: {
      description: {
        component:
          "Approve, reject and flag buttons for a reviewer's verdict, built on bits-ui Toolbar.",
      },
      controls: { include: ownProps },
    },
    controls: { include: ownProps },
  },
  args: { onverdict: fn() },
});
</script>

<Story name="Playground" />
