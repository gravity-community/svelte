<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Button from "../button/button.svelte";
import Icon from "../icon/icon.svelte";
import Input from "../input/input.svelte";
import SearchInput from "../search-input/search-input.svelte";
import Select from "../select/select.svelte";
import InputGroup from "./input-group.svelte";

const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
];

const { Story } = defineMeta({
  title: "Inputs/InputGroup",
  component: InputGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Joins a control and its action into one field by squaring the corners where they meet.",
      },
    },
  },
});
</script>

<Story name="With a button" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <InputGroup class="w-120">
      <Input class="flex-1" placeholder="Name your new key" />
      <Button type="submit">Create key</Button>
    </InputGroup>
  {/snippet}
</Story>

<Story name="With an icon action" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <InputGroup class="w-120">
      <Input
        class="flex-1 font-mono"
        readonly
        value="gk_live_4f9a1c77e0b2436d8e51ac93bd6f0a28"
      />
      <Button energy="-1" intent="neutral" aria-label="Copy key">
        {#snippet leadingIcon()}
          <Icon glyph="copy" class="size-full" />
        {/snippet}
      </Button>
    </InputGroup>
  {/snippet}
</Story>

<!-- Every child takes the same shape, so pills read as one stadium. -->
<Story name="Pill" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <InputGroup class="w-120">
      <SearchInput shape="pill" class="flex-1" placeholder="Search registers" />
      <Button shape="pill">Search</Button>
    </InputGroup>
  {/snippet}
</Story>

<!-- A clearable Select keeps its class on a wrapper; the trigger inherits the wrapper's squared corners. -->
<Story name="Clearable select" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <InputGroup class="w-120">
      <Select
        items={roles}
        value="editor"
        clearable
        aria-label="Role"
        class="flex-1"
      />
      <Button>Assign</Button>
    </InputGroup>
  {/snippet}
</Story>
