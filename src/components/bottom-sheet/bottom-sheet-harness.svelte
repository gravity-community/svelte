<script lang="ts">
import type { ComponentProps } from "svelte";
import GlossaryTerm from "../glossary-term/glossary-term.svelte";
import Header from "../header/header.svelte";
import PhoneInput from "../phone-input/phone-input.svelte";
import BottomSheet from "./bottom-sheet.svelte";

// bits-ui layers in and over the sheet, to check how they share Escape and focus.
let props: Omit<ComponentProps<typeof BottomSheet>, "children"> = $props();
</script>

<Header links={[{ href: "#docs", label: "Docs" }]}>
  {#snippet brand()}Gravity{/snippet}
</Header>

<BottomSheet {...props}>
  <GlossaryTerm
    term="Beneficial owner"
    definition="The natural person who ultimately owns or controls a company."
  />
  <PhoneInput country="cz" aria-label="Phone" />
</BottomSheet>
