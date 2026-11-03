<script lang="ts">
import type { ComponentProps } from "svelte";
import { Button, Collapsible } from "@gravity-community/svelte";

// A Gravity Button as the trigger, after a row that holds a link, as a Show more list has.
let { open = $bindable(false), ...rest }: Omit<
  ComponentProps<typeof Collapsible>,
  "title" | "trigger" | "children"
> = $props();
</script>

<Collapsible bind:open {...rest}>
  {#snippet trigger({ props })}
    <Button {...props} energy="0" intent="neutral" size="sm">
      {open ? "Show fewer" : "Show all 4 records"}
    </Button>
  {/snippet}
  <a href="#vltava">Vltava Trade s.r.o.</a>
</Collapsible>
