<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy } from "../../utils/energy.ts";
import DataList from "./data-list.svelte";

const energies = ["2", "1", "0"] as const;

const { Story } = defineMeta({
  title: "Data display/DataList",
  component: DataList,
  parameters: {
    docs: {
      description: {
        component:
          "A panel of labelled values, each with its own copy button, such as the parts of a DNS record.",
      },
    },
  },
  args: {
    energy: "2",
    title: "DNS TXT record",
    entries: [
      { label: "Type", value: "TXT" },
      { label: "Name", value: "_registry-challenge.example.com" },
      {
        label: "Value",
        value: "registry-site-verification=QF7X2M9K4TZ8VR3NP6WB",
      },
      { label: "TTL", value: "" },
    ],
  },
  argTypes: {
    energy: { control: "inline-radio", options: energies },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <DataList {...args} class="w-[400px]" />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template(args)}
    <Matrix rows={energies}>
      {#snippet cell(energy)}
        <DataList {...args} {energy} class="w-[400px]" />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Rows name the level each DataList is given; one well down it shows a level lower, stopping at ghost. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template(args)}
    <Well>
      <Matrix rows={energies}>
        {#snippet cell(energy)}
          <DataList
            {...args}
            energy={resolveEnergy(energy, energies, 1)}
            class="w-[400px]"
          />
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>

<!-- Copy is a quiet control, ghost neutral at every level; a value left empty shows a dash and no Copy. -->
<Story name="Parts" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies}>
      {#snippet cell(energy)}
        <DataList
          {energy}
          title="Passkey"
          entries={[
            { label: "Credential ID", value: "kJ8Qm2xV7pLr" },
            { label: "Last used", value: "" },
          ]}
          class="w-[320px]"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
