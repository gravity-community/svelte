<script lang="ts">
import type { ComponentProps } from "svelte";
import { Button, Icon, Tooltip } from "@gravity-community/svelte";

// An icon-only Gravity Button as the trigger, to check the spread props reach the element.
type Props = Omit<ComponentProps<typeof Tooltip>, "trigger"> & {
  /** The trigger's own action, set after the spread props as a caller sets one. */
  onaction?: () => void;
};

let { onaction, ...props }: Props = $props();
</script>

<Tooltip {...props}>
  {#snippet trigger({ props })}
    {#if onaction}
      <Button
        {...props}
        energy="0"
        intent="neutral"
        size="sm"
        aria-label="Undo"
        onclick={onaction}
      >
        {#snippet leadingIcon()}<Icon glyph="undo" />{/snippet}
      </Button>
    {:else}
      <Button {...props} energy="0" intent="neutral" size="sm" aria-label="Undo">
        {#snippet leadingIcon()}<Icon glyph="undo" />{/snippet}
      </Button>
    {/if}
  {/snippet}
</Tooltip>
