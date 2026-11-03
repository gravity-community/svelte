<script lang="ts">
import type { ComponentProps } from "svelte";
import EnergyScope from "../utils/energy-scope.svelte";
import type { EnergyScope as Scope } from "../utils/energy-scope.ts";
import Badge from "./badge/badge.svelte";
import Button from "./button/button.svelte";
import IconCircle from "./icon-circle/icon-circle.svelte";

// Test harness: Button, IconCircle and Badge (test ids "button", "icon-circle", "badge") inside one <EnergyScope> per entry of `scopes`, outermost first; an undefined entry resets, and none leaves the scope around the harness.
type Props = {
  scopes?: (Scope | undefined)[];
  button?: ComponentProps<typeof Button>;
  iconCircle?: ComponentProps<typeof IconCircle>;
  badge?: ComponentProps<typeof Badge>;
};

let { scopes = [], button, iconCircle, badge }: Props = $props();
</script>

{#snippet nest(remaining: (Scope | undefined)[])}
  {#if remaining.length > 0}
    <EnergyScope scope={remaining[0]}>
      {@render nest(remaining.slice(1))}
    </EnergyScope>
  {:else}
    <Button data-testid="button" {...button}>Part</Button>
    <IconCircle data-testid="icon-circle" {...iconCircle} />
    <Badge data-testid="badge" {...badge}>Part</Badge>
  {/if}
{/snippet}

{@render nest(scopes)}
