<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Collapsible from "./collapsible.svelte";

const states = ["closed", "open"] as const;

// bits-ui's prop types slip every HTML attribute past the docgen filter.
const ownProps = [
  "title",
  "open",
  "onOpenChange",
  "onOpenChangeComplete",
  "disabled",
];

const { Story } = defineMeta({
  title: "Data display/Collapsible",
  component: Collapsible,
  parameters: {
    docs: {
      description: {
        component:
          "A titled section that hides its detail until opened, built on bits-ui Collapsible.",
      },
      controls: { include: ownProps },
    },
    controls: { include: ownProps },
  },
  args: { title: "Full access", open: false },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Collapsible {...args} class="w-[480px]">
      Competent authorities and obliged entities see the complete verified
      ownership chain, with the evidence behind every link.
    </Collapsible>
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states}>
      {#snippet cell(state)}
        <Collapsible
          title="Full access"
          open={state === "open"}
          class="w-[480px]"
        >
          Competent authorities and obliged entities see the complete verified
          ownership chain, with the evidence behind every link.
        </Collapsible>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="FAQ" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-[480px] flex-col">
      <Collapsible title="How do I invite a teammate?" open>
        Open Settings, then Members, and enter their work email. The invitation
        stays valid for seven days.
      </Collapsible>
      <Collapsible title="Can I change my plan later?">
        Yes. An upgrade applies straight away; a downgrade takes effect at the
        end of the current billing period.
      </Collapsible>
      <Collapsible title="How do I export my data?">
        Choose Export under Settings, then Data. We email you a download link
        once the archive is ready.
      </Collapsible>
    </div>
  {/snippet}
</Story>
