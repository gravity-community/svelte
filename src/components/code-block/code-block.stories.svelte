<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import CodeBlock from "./code-block.svelte";
import type { CodeBlockTab } from "./types.ts";

const tabs: CodeBlockTab[] = [
  {
    label: "shell",
    code: `$ curl https://api.example.com/v1/records \\
    -H "Authorization: Bearer $TOKEN"`,
  },
  {
    label: "http",
    code: `GET /v1/records HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>`,
  },
  {
    label: "ts",
    code: `const response = await fetch("https://api.example.com/v1/records", {
  headers: { Authorization: "Bearer " + token },
});`,
  },
];

const { Story } = defineMeta({
  title: "Typography/CodeBlock",
  component: CodeBlock,
  parameters: {
    docs: {
      description: {
        component:
          "Dark code panel with a copy button, switching between panes with bits-ui Tabs when given several.",
      },
    },
  },
  args: {
    label: "shell",
    code: "$ deno task check\n$ deno task test",
    copy: true,
  },
  argTypes: {
    label: { control: "text" },
    code: { control: "text" },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <CodeBlock {...args} class="w-[560px]" />
  {/snippet}
</Story>

<Story name="With tabs" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <CodeBlock {tabs} class="w-[560px]" />
  {/snippet}
</Story>
