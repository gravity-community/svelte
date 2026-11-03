<script lang="ts">
import type { ComponentProps } from "svelte";
import { Button, Popover } from "@gravity-community/svelte";

// A Gravity Button as the trigger, to check the spread props reach the element.
let props: Omit<
  ComponentProps<typeof Popover>,
  "trigger" | "children" | "footer"
> = $props();
let owner = $state<HTMLElement>();
</script>

<!-- A pick takes the focus to the owner it picks; Done gives it back to the trigger. -->
<Popover {...props}>
  {#snippet trigger({ props })}
    <Button {...props} variant="outline" intent="neutral" size="sm">AML</Button>
  {/snippet}
  {#snippet children({ close })}
    <p>Two owners still need a verified identity.</p>
    <button
      type="button"
      onclick={() => {
        close({ returnFocus: false });
        owner?.focus();
      }}
    >
      Jana Nováková
    </button>
  {/snippet}
  {#snippet footer({ close })}
    <Button size="sm" onclick={() => close()}>Done</Button>
  {/snippet}
</Popover>
<h3 bind:this={owner} tabindex="-1">Jana Nováková</h3>
