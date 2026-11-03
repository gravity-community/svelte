<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Button from "../button/button.svelte";
import Icon from "../icon/icon.svelte";
import Input from "../input/input.svelte";
import InputGroup from "./input-group.svelte";

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
      <Input class="flex-1" variant="tinted" placeholder="Name your new key" />
      <Button type="submit">Create key</Button>
    </InputGroup>
  {/snippet}
</Story>

<Story name="With an icon action" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <InputGroup class="w-120">
      <Input
        class="flex-1 font-mono"
        variant="tinted"
        readonly
        value="gk_live_4f9a1c77e0b2436d8e51ac93bd6f0a28"
      />
      <Button variant="soft" intent="neutral" aria-label="Copy key">
        {#snippet leadingIcon()}
          <Icon glyph="copy" class="size-full" />
        {/snippet}
      </Button>
    </InputGroup>
  {/snippet}
</Story>
