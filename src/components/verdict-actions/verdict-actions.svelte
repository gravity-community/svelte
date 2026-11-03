<script module lang="ts">
import { tv } from "../../utils/classes.ts";
import type { Verdict } from "./types.ts";

const chip = tv({
  base:
    "flex size-6 items-center justify-center rounded-full font-semibold transition-transform select-none hover:scale-110 forced-colors:border",
  variants: {
    verdict: {
      approve: "bg-success-subtle text-[11px] text-success-strong",
      reject: "bg-danger-subtle text-xs text-danger-strong",
      flag: "bg-warning-subtle text-[11px] text-warning-strong",
    },
  },
});

const VERDICTS: { verdict: Verdict; glyph: string; label: string }[] = [
  { verdict: "approve", glyph: "✓", label: "Approve" },
  { verdict: "reject", glyph: "×", label: "Reject" },
  { verdict: "flag", glyph: "!", label: "Flag" },
];
</script>

<script lang="ts">
import { Toolbar } from "bits-ui";
import { cn } from "../../utils/classes.ts";

type Props = Omit<Toolbar.RootProps, "children" | "child"> & {
  onverdict?: (verdict: Verdict) => void;
};

let { onverdict, ref = $bindable(null), class: className, ...rest }: Props =
  $props();
</script>

<Toolbar.Root
  bind:ref
  aria-label="Verdict"
  class={cn(
    "inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1",
    className,
  )}
  {...rest}
>
  {#each VERDICTS as { verdict, glyph, label } (verdict)}
    <Toolbar.Button
      class={chip({ verdict })}
      aria-label={label}
      title={label}
      onclick={() => onverdict?.(verdict)}
    >
      {glyph}
    </Toolbar.Button>
  {/each}
</Toolbar.Root>
