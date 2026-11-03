<script lang="ts">
import { Button, ListItem, Popover } from "@gravity-community/svelte";
</script>

<!-- Test harness: a popover opened from a soft row's action, with a Button in its body and its footer. -->
<ListItem title="Interzone Inc." energy="2">
  {#snippet actions()}
    <Popover open title="AML: 2 things owed">
      {#snippet trigger({ props })}
        <Button {...props} size="sm">AML</Button>
      {/snippet}
      <Button size="sm">Verify</Button>
      {#snippet footer()}
        <Button size="sm">Open checklist</Button>
      {/snippet}
    </Popover>
  {/snippet}
</ListItem>
