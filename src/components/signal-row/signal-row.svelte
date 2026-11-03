<script module lang="ts">
import { tv } from "../../utils/classes.ts";
import type { IconGlyph } from "../icon/glyphs.ts";
import type { SignalRowSeverity } from "./types.ts";

const signalRow = tv({
  slots: {
    base: "flex w-full items-start gap-2 text-[13px] leading-5",
    // 14px, centred on the first 20px line.
    marker: "mt-[3px] size-3.5 shrink-0",
  },
  variants: {
    severity: {
      fail: { marker: "text-danger-strong" },
      high: { marker: "text-danger-strong" },
      medium: { marker: "text-warning-strong" },
      pass: { marker: "text-success-strong" },
      info: { marker: "text-info-strong" },
    },
  },
});

// A shape per severity, so none is told apart by hue alone. fail and pass are
// validator verdicts (filled circles), high and medium risks (triangles).
const GLYPH: Record<SignalRowSeverity, IconGlyph> = {
  fail: "cross-full",
  high: "warning-full",
  medium: "warning",
  pass: "check-full",
  info: "info-circle",
};
</script>

<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";
import Icon from "../icon/icon.svelte";

type Props = HTMLAttributes<HTMLDivElement> & {
  severity: SignalRowSeverity;
  /** Right-aligned time, for timeline feeds. */
  timestamp?: string;
  /** Trailing action, e.g. "Merge →". */
  action?: Snippet;
};

let {
  severity,
  timestamp,
  action,
  class: className,
  children,
  ...rest
}: Props = $props();

const styles = $derived(signalRow({ severity }));
</script>

<div class={cn(styles.base(), className)} {...rest}>
  <Icon glyph={GLYPH[severity]} class={styles.marker()} />
  <span class="min-w-0 flex-1 text-fg">{@render children?.()}</span>
  {#if action}
    <span class="shrink-0 text-xs leading-5 font-medium text-fg">
      {@render action()}
    </span>
  {/if}
  {#if timestamp}
    <span class="shrink-0 text-right text-subtle-fg">{timestamp}</span>
  {/if}
</div>
