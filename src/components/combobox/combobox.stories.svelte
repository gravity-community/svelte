<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Button from "../button/button.svelte";
import Field from "../field/field.svelte";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy, SHAPES } from "../../utils/energy.ts";
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
const energies = ["2", "1"] as const;
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
    energy: "2",
    size: "md",
    shape: "rounded",
    loading: false,
    invalid: false,
    disabled: false,
  },
  argTypes: {
    energy: { control: "inline-radio", options: energies },
    size: { control: "inline-radio", options: sizes },
    shape: { control: "inline-radio", options: SHAPES },
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
    <Matrix rows={energies} columns={sizes}>
      {#snippet cell(energy, size)}
        <Combobox
          {energy}
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
    <Matrix rows={states} columns={energies}>
      {#snippet cell(state, energy)}
        <Combobox
          {energy}
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

<!-- Rows name the level each field is given; one well down both decay to faint, passed by hand, and the frame glazes. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Well>
      <Matrix rows={energies} columns={sizes}>
        {#snippet cell(energy, size)}
          <Combobox
            energy={resolveEnergy(energy, energies, 1)}
            {size}
            items={companies}
            placeholder="Name or IČO"
            aria-label="Company"
            class="w-56"
          />
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>

<!-- A held pick's two lines clear the pill's curve at every size. -->
<Story name="Pill" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies} columns={sizes}>
      {#snippet cell(energy, size)}
        <Combobox
          {energy}
          {size}
          shape="pill"
          items={companies}
          {...stateProps.selected}
          aria-label="Company"
          class="w-72"
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
