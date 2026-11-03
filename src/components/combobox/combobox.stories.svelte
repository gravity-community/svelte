<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Button from "../button/button.svelte";
import Field from "../field/field.svelte";
import Matrix from "../../storybook/matrix.svelte";
import Combobox from "./combobox.svelte";
import type { ComboboxItem } from "./types.ts";

const companies = [
  {
    value: "27082440",
    title: "Interzone s.r.o.",
    meta: "IČO 270 82 440 · Praha 1 · společnost s ručením omezeným",
  },
  {
    value: "06415822",
    title: "Interzone Holding a.s.",
    meta: "IČO 064 15 822 · Brno · akciová společnost",
  },
  {
    value: "08731951",
    title: "Interzone Logistics s.r.o.",
    meta: "IČO 087 31 951 · Ostrava · společnost s ručením omezeným",
  },
  {
    value: "22691405",
    title: "Interzone, z. s.",
    meta: "IČO 226 91 405 · Praha 7 · spolek",
  },
] satisfies ComboboxItem[];
const variants = ["default", "tinted", "outline"] as const;
const sizes = ["sm", "md", "lg"] as const;
const states = [
  "default",
  "filled",
  "loading",
  "invalid",
  "disabled",
  "selected",
] as const;
const stateProps = {
  default: {},
  filled: { inputValue: "Interzone" },
  loading: { inputValue: "Interzone", loading: true },
  invalid: { inputValue: "270 82 441", invalid: true },
  disabled: { disabled: true },
  selected: { inputValue: "Interzone", value: "27082440", holdPick: true },
};

const { Story } = defineMeta({
  title: "Inputs/Combobox",
  component: Combobox,
  parameters: {
    docs: {
      description: {
        component:
          "A search field that lists its matches as ResultOption rows below it, built on bits-ui Combobox.",
      },
    },
  },
  args: {
    items: companies,
    placeholder: "Name or IČO",
    variant: "tinted",
    size: "md",
    loading: false,
    invalid: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: variants },
    size: { control: "inline-radio", options: sizes },
  },
});
</script>

<script lang="ts">
let query = $state("");
let pickQuery = $state("");
let picked = $state("");
const matches = $derived(matching(query));
const pickMatches = $derived(matching(pickQuery));

function matching(text: string): ComboboxItem[] {
  const term = text.trim().toLowerCase();
  return term
    ? companies.filter((c) => c.title.toLowerCase().includes(term))
    : [];
}
</script>

<!-- Type to open the list. -->
<Story name="Playground">
  {#snippet template(args)}
    <Combobox {...args} aria-label="Company" class="w-[400px]" />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={variants} columns={sizes}>
      {#snippet cell(variant, size)}
        <Combobox
          {variant}
          {size}
          items={companies}
          placeholder="Name or IČO"
          aria-label="Company"
          class="w-56"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states} columns={variants}>
      {#snippet cell(state, variant)}
        <Combobox
          {variant}
          items={companies}
          placeholder="Name or IČO"
          aria-label="Company"
          class="w-56"
          {...stateProps[state]}
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- The caller filters (or fetches) the matches; with none the list stays closed. -->
<Story name="Company search" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Field label="Company" for="company" class="w-[400px]">
      <Combobox
        id="company"
        variant="tinted"
        items={matches}
        bind:inputValue={query}
        placeholder="Name or IČO"
      />
    </Field>
  {/snippet}
</Story>

<!-- holdPick: a pick waits in the field, title and meta, for Continue. The cross, Backspace or Delete remove it, greying Continue out again and bringing the matches back; typing starts a new search. -->
<Story name="Pick, then continue" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <form
      class="flex w-[400px] flex-col gap-6"
      onsubmit={(event) => event.preventDefault()}
    >
      <Field label="Company" for="picked-company">
        <Combobox
          id="picked-company"
          variant="tinted"
          items={pickMatches}
          holdPick
          bind:value={picked}
          bind:inputValue={pickQuery}
          placeholder="Name or IČO"
        />
      </Field>
      <Button type="submit" disabled={!picked} class="w-full">Continue</Button>
    </form>
  {/snippet}
</Story>
