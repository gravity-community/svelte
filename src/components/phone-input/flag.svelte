<script module lang="ts">
import * as FLAGS from "country-flag-icons/string/3x2";

// Imported whole (~47 kB gzipped) to keep the lookup synchronous.
const flags = FLAGS as unknown as Record<string, string | undefined>;

// The hairline keeps white-edged flags (pl, jp) legible on the field's fill.
const base =
  "block shrink-0 overflow-clip rounded-[2px] inset-ring inset-ring-border-subtle [&>svg]:block [&>svg]:size-full";
</script>

<script lang="ts">
import type { ClassValue } from "svelte/elements";
import { cn } from "../../utils/classes.ts";

type Props = {
  /** ISO 3166-1 alpha-2, either case. */
  country: string;
  class?: ClassValue;
};

let { country, class: className }: Props = $props();

const svg = $derived(flags[country.toUpperCase()]);
</script>

{#if svg}
  <span class={cn(base, className)} aria-hidden="true">{@html svg}</span>
{/if}
