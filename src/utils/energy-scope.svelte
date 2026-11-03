<script lang="ts">
import type { Snippet } from "svelte";
import { type EnergyScope, setEnergyScope } from "./energy-scope.ts";

type Props = { scope?: EnergyScope; children: Snippet };

let { scope, children }: Props = $props();

// For a slot whose level differs from its component's (ListItem's actions), or with no scope to reset it (overlay content).
setEnergyScope(() => scope);
</script>

{@render children()}
