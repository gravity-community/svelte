<script lang="ts">
import type { ComponentProps } from "svelte";
import Icon from "../icon/icon.svelte";
import Input from "../input/input.svelte";

// type="search" is fixed: it's what makes this a search field, and e2e suites select on it.
type Props = Omit<ComponentProps<typeof Input>, "type" | "leadingIcon">;

let { variant = "tinted", value = $bindable(), ...rest }: Props = $props();
</script>

<Input {...rest} type="search" {variant} bind:value>
  {#snippet leadingIcon()}
    <Icon glyph="search" class="size-full" />
  {/snippet}
</Input>
