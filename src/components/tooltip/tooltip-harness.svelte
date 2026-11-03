<script lang="ts">
import type { ComponentProps } from "svelte";
import { Button, Icon, Tooltip } from "@gravity-community/svelte";

// An icon-only Gravity Button as the trigger, to check the spread props reach the element.
let props: Omit<ComponentProps<typeof Tooltip>, "trigger"> = $props();
</script>

<Tooltip {...props}>
  {#snippet trigger({ props })}
    <Button {...props} variant="ghost" intent="neutral" size="sm" aria-label="Undo">
      {#snippet leadingIcon()}<Icon glyph="undo" />{/snippet}
    </Button>
  {/snippet}
</Tooltip>
