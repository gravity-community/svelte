<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { Label } from "bits-ui";
import { cn } from "../../utils/classes.ts";

type Props = HTMLAttributes<HTMLDivElement> & {
  label?: string;
  hint?: string;
  /** Validation message; pair it with the control's `invalid`. */
  error?: string;
  /** The control's id. */
  for?: string;
  /** Read-only text shown in place of a control. */
  value?: string;
  children?: Snippet;
};

let {
  label,
  hint,
  error,
  for: forId,
  value,
  class: className,
  children,
  ...rest
}: Props = $props();
</script>

<div
  class={cn("flex w-full flex-col items-start gap-1.5", className)}
  {...rest}
>
  {#if label}
    <Label.Root
      for={forId}
      class="text-xs leading-4 font-medium whitespace-nowrap text-muted-fg"
    >
      {label}
    </Label.Root>
  {/if}
  {#if value !== undefined}
    <p class="text-base leading-6 text-fg">{value}</p>
  {:else}
    {@render children?.()}
  {/if}
  {#if hint}
    <p class="w-full text-xs leading-4 text-subtle-fg">{hint}</p>
  {/if}
  {#if error}
    <p role="alert" class="text-xs leading-4 text-danger-strong">{error}</p>
  {/if}
</div>
