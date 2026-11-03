<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import GlossaryTerm from "./glossary-term.svelte";

const beneficialOwner = {
  term: "Beneficial owner",
  translation: "skutečný majitel",
  definition:
    "The natural person who ultimately owns or controls a company, even through a chain of other entities.",
};

// bits-ui's prop types slip every HTML attribute past the docgen filter.
const ownProps = ["term", "translation", "definition"];

const { Story } = defineMeta({
  title: "Data display/GlossaryTerm",
  component: GlossaryTerm,
  parameters: {
    docs: {
      description: {
        component:
          "A term in running text that shows its definition on hover or click, built on bits-ui Popover.",
      },
      controls: { include: ownProps },
    },
    controls: { include: ownProps },
  },
  args: beneficialOwner,
});
</script>

<Story name="Playground" />

<!-- Hover or click the term to open its definition. -->
<Story name="In a sentence" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <p class="w-[480px] text-[15px] leading-7 text-fg">
      Each record names the company's
      <GlossaryTerm {...beneficialOwner}>beneficial owners</GlossaryTerm>
      and the chain of entities through which they hold control.
    </p>
  {/snippet}
</Story>
