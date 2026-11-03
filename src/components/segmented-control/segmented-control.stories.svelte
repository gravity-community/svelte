<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Checkbox from "../checkbox/checkbox.svelte";
import SegmentedControl from "./segmented-control.svelte";

const sizes = ["md", "sm"] as const;
const periods = [{ label: "Day" }, { label: "Week" }, { label: "Month" }];

const { Story } = defineMeta({
  title: "Inputs/SegmentedControl",
  component: SegmentedControl,
  parameters: {
    docs: {
      description: {
        component:
          "Switches between a few related views, as a bits-ui ToggleGroup or, when every item has an href, as links.",
      },
    },
  },
  args: { items: periods, value: "Week", size: "md", fill: false },
  argTypes: {
    size: { control: "inline-radio", options: sizes },
  },
});
</script>

<script lang="ts">
let view = $state("overview");
let revealed = $state(false);
</script>

<Story name="Playground">
  {#snippet template(args)}
    <div class="flex w-96 justify-center">
      <SegmentedControl {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Sizes" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={sizes}>
      {#snippet cell(size)}
        <SegmentedControl {size} items={periods} value="Week" />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- fill stretches the control to its container and splits it evenly between the segments. -->
<Story name="Fill" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="w-96">
      <SegmentedControl fill items={periods} value="Week" />
    </div>
  {/snippet}
</Story>

<!-- When every item has an href the segments are links, so the selection lives in the URL and needs no script. -->
<Story name="Links" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <SegmentedControl
      value="overview"
      items={[
        { label: "Overview", value: "overview", href: "#overview" },
        { label: "Activity", value: "activity", href: "#activity" },
        { label: "Settings", value: "settings", href: "#settings" },
      ]}
    />
  {/snippet}
</Story>

<!-- Unequal labels show the bar's edges springing at different speeds. -->
<Story name="Selectable" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <SegmentedControl
      value={view}
      items={[
        { label: "Overview", value: "overview" },
        { label: "Activity", value: "activity" },
        { label: "Billing history", value: "billing" },
      ]}
      onselect={(next) => (view = next)}
    />
  {/snippet}
</Story>

<!-- Mounted inside display:none, the bar arrives in place once the control is revealed. -->
<Story name="Revealed late" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex flex-col items-start gap-4">
      <label class="flex items-center gap-2 font-sans text-sm text-fg">
        <Checkbox bind:checked={revealed} />
        Reveal
      </label>
      <div class={revealed ? "" : "hidden"}>
        <SegmentedControl items={periods} value="Month" />
      </div>
    </div>
  {/snippet}
</Story>
