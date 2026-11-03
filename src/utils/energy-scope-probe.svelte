<script lang="ts">
import EnergyScope from "./energy-scope.svelte";
import Probe from "./energy-scope-probe.svelte";
import { type EnergyScope as Scope, getEnergyScope } from "./energy-scope.ts";

// Test harness: one <EnergyScope> per entry, outermost first, each holding the next probe in its children snippet; the innermost prints the scope it reads.
type Props = { scopes?: (Scope | undefined)[] };

let { scopes = [] }: Props = $props();

const scope = getEnergyScope();
const [outer, ...inner] = $derived(scopes);
const read = $derived({
  "data-level": scope()?.level,
  "data-fill": scope()?.fill,
});
</script>

<div>
  {#if scopes.length > 0}
    <EnergyScope scope={outer}><Probe scopes={inner} /></EnergyScope>
  {:else}
    <span data-testid="probe" {...read}></span>
  {/if}
</div>
