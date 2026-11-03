<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Callout from "../callout/callout.svelte";
import InlineCode from "./inline-code.svelte";

const { Story } = defineMeta({
  title: "Typography/InlineCode",
  component: InlineCode,
  parameters: {
    docs: {
      description: {
        component:
          "Monospace chip for commands, identifiers and file names inside running text.",
      },
    },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <InlineCode {...args}>deno task check</InlineCode>
  {/snippet}
</Story>

<!-- Both line boxes stay taller than the 18px chip, so a chip never changes the leading. -->
<Story name="In prose" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-[560px] flex-col gap-6">
      <p class="text-[15px] leading-[1.75] text-muted-fg">
        Run <InlineCode>deno task check</InlineCode> before you push. It
        type-checks the library with <InlineCode>deno check</InlineCode> and
        every component with <InlineCode>svelte-check</InlineCode>, then lists
        the errors by file.
      </p>
      <Callout title="Formatting">
        Run <InlineCode>deno fmt</InlineCode> to format the
        <InlineCode>.ts</InlineCode> and <InlineCode>.svelte</InlineCode> files
        in place.
      </Callout>
    </div>
  {/snippet}
</Story>
