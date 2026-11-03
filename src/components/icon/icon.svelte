<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const icon = tv({
  slots: {
    box: "relative flex size-4 shrink-0",
    count:
      "absolute top-0 right-0 flex h-3.5 min-w-3.5 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-1 font-sans text-[10px] leading-3.5 font-semibold tracking-normal tabular-nums forced-colors:border",
    status:
      "absolute -top-0.5 -right-0.5 size-2 rounded-full forced-colors:bg-[CanvasText]",
  },
  variants: {
    countIntent: {
      primary: { count: "bg-primary-solid text-on-primary" },
      success: { count: "bg-success-solid text-on-success" },
      warning: { count: "bg-warning-solid text-on-warning" },
      danger: { count: "bg-danger-solid text-on-danger" },
      neutral: { count: "bg-neutral-solid text-on-neutral" },
      accent: { count: "bg-accent-solid text-on-accent" },
    },
    statusIntent: {
      primary: { status: "bg-primary-solid" },
      success: { status: "bg-success-solid" },
      warning: { status: "bg-warning-solid" },
      danger: { status: "bg-danger-solid" },
      neutral: { status: "bg-neutral-solid" },
      accent: { status: "bg-accent-solid" },
    },
  },
  defaultVariants: { countIntent: "primary", statusIntent: "primary" },
});
</script>

<script lang="ts">
import type { SVGAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";
import { GLYPHS, type IconGlyph } from "./glyphs.ts";

type Props = SVGAttributes<SVGSVGElement> & VariantProps<typeof icon> & {
  glyph: IconGlyph;
  /** Number pill centred on the top-right corner, for icon-only hosts; 0 shows nothing. */
  count?: number;
  /** Dot on the top-right corner, left out while a count shows. */
  status?: boolean;
};

let {
  glyph,
  count,
  countIntent,
  status = false,
  statusIntent,
  class: className,
  ...rest
}: Props = $props();

const styles = $derived(icon({ countIntent, statusIntent }));
</script>

{#snippet svg(svgClass: string)}
  <svg
  class={svgClass}
  viewBox="0 0 24 24"
  fill="none"
  aria-hidden="true"
  {...rest}
>
    {@html GLYPHS[glyph]}
  </svg>
{/snippet}

{#if count || status}
  <!-- The class sizes this box, not the svg, so the indicators keep their pixel size. -->
  <span class={cn(styles.box(), className)} aria-hidden="true">
    {@render svg("size-full")}
    {#if count}
      <span class={styles.count()}>{count}</span>
    {:else}
      <span class={styles.status()}></span>
    {/if}
  </span>
{:else}
  {@render svg(cn("size-4", className))}
{/if}
