<script lang="ts">
import type { ComponentProps } from "svelte";
import Input from "./input.svelte";

// A real form, so a submit counter can prove the trailing buttons never submit it.
let { value = $bindable(), ...rest }: ComponentProps<typeof Input> = $props();

let submits = $state(0);
</script>

<form
  onsubmit={(event) => {
    event.preventDefault();
    submits += 1;
  }}
>
  <Input {...rest} bind:value />
  <button type="submit">Go</button>
</form>

<span data-testid="bound">{value}</span>
<span data-testid="bound-type">{typeof value}</span>
<span data-testid="submits">{submits}</span>
