<script lang="ts">
import type { ComponentProps } from "svelte";
import { Button, Status } from "@gravity-community/svelte";

// A Status with a main action given no energy, of the `main` intent, and the fixed ghost neutral second one.
type Props = Omit<ComponentProps<typeof Status>, "actions"> & {
  main?: ComponentProps<typeof Button>["intent"];
};

let { main, ...props }: Props = $props();
</script>

<Status {...props}>
  {#snippet actions()}
    <Button intent={main}>Main</Button>
    <Button energy="0" intent="neutral">Second</Button>
  {/snippet}
</Status>
