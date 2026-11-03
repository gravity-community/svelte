<script lang="ts">
import type { ComponentProps } from "svelte";
import { Button, Callout } from "@gravity-community/svelte";

// A Callout whose action is given no energy, of the `main` intent.
type Props = Omit<ComponentProps<typeof Callout>, "actions" | "children"> & {
  main?: ComponentProps<typeof Button>["intent"];
};

let { main, ...props }: Props = $props();
</script>

<Callout {...props}>
  Nothing is published until you submit.
  {#snippet actions()}
    <Button size="sm" intent={main}>Submit</Button>
  {/snippet}
</Callout>
