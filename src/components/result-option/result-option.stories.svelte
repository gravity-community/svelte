<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import ResultOption from "./result-option.svelte";

const states = ["default", "highlighted", "disabled"] as const;
const stateProps = {
  default: {},
  highlighted: { "data-highlighted": "" },
  disabled: { "data-disabled": "" },
};

const companies = [
  {
    title: "Interzone s.r.o.",
    meta: "IČO 270 82 440 · Praha 1 · společnost s ručením omezeným",
  },
  {
    title: "Interzone Holding a.s.",
    meta: "IČO 064 15 822 · Brno · akciová společnost",
  },
  {
    title: "Interzone Logistics s.r.o.",
    meta: "IČO 087 31 950 · Ostrava · společnost s ručením omezeným",
  },
];

const { Story } = defineMeta({
  title: "Inputs/ResultOption",
  component: ResultOption,
  parameters: {
    docs: {
      description: {
        component:
          "Two-line search result for a bits-ui Combobox, rendered as the item's child so bits-ui keeps the keyboard and ARIA handling.",
      },
    },
  },
  args: companies[0],
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <ResultOption {...args} class="w-[392px]" />
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template(args)}
    <Matrix rows={states}>
      {#snippet cell(state)}
        <ResultOption {...args} {...stateProps[state]} class="w-[392px]" />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Search results" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div
      role="listbox"
      aria-label="Matching companies"
      class="flex w-[400px] flex-col rounded-xl border border-border-subtle bg-surface-raised p-1"
    >
      {#each companies as company, i (company.title)}
        <ResultOption
          role="option"
          aria-selected={i === 1}
          {...i === 1 ? { "data-highlighted": "" } : {}}
          {...company}
        />
      {/each}
    </div>
  {/snippet}
</Story>
