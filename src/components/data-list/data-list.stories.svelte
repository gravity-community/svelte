<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import DataList from "./data-list.svelte";

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
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <DataList {...args} class="w-[400px]" />
  {/snippet}
</Story>
