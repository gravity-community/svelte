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
  /** Gives the label, hint and error the ids `<idPrefix>-label`, `-hint` and `-error`, for a control that points at them. */
  idPrefix?: string;
  children?: Snippet;
};

let {
  label,
  hint,
  error,
  for: forId,
  value,
  idPrefix,
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
      id={idPrefix && `${idPrefix}-label`}
      for={forId}
      class="text-xs leading-4 font-medium text-muted-fg"
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
    <p
      id={idPrefix && `${idPrefix}-hint`}
      class="w-full text-xs leading-4 text-subtle-fg"
    >
      {hint}
    </p>
  {/if}
  {#if error}
    <p
      id={idPrefix && `${idPrefix}-error`}
      role="alert"
      class="text-xs leading-4 text-danger-strong"
    >
      {error}
    </p>
  {/if}
</div>
