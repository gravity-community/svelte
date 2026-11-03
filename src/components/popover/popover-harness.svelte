<script lang="ts">
import type { ComponentProps } from "svelte";
import { Button, Popover } from "@gravity-community/svelte";

// A Gravity Button as the trigger, to check the spread props reach the element.
let props: Omit<ComponentProps<typeof Popover>, "trigger" | "children"> =
  $props();
</script>

<Popover {...props}>
  {#snippet trigger({ props })}
    <Button {...props} variant="outline" intent="neutral" size="sm">AML</Button>
  {/snippet}
  <p>Two owners still need a verified identity.</p>
</Popover>
