<script module lang="ts">
import { tv } from "../../utils/classes.ts";

// The row has no padding so its text sits on the section rail; the tint bleeds
// out instead (-inset-3 -end-6), doubled where trailing controls are pulled out.
const BLEED = 12;
const BLEED_END = 24;

const listItem = tv({
  slots: {
    base: "group relative isolate flex gap-4 rounded-xl transition-interactive",
    tint:
      "pointer-events-none absolute -inset-3 -end-6 -z-10 rounded-xl opacity-0 transition-interactive",
    media: "flex shrink-0 items-center justify-start",
    body: "",
    title: "",
    meta: "block text-[13px] text-subtle-fg",
    detail: "text-right text-[13px]",
  },
  variants: {
    intent: {
      neutral: { tint: "bg-surface-subtle" },
      danger: { tint: "bg-danger-subtle" },
    },
    tinted: { true: { tint: "opacity-100 forced-colors:border" } },
    link: { true: { tint: "group-hover:opacity-100" } },
    // Media and controls are boxes, not lines of text: only a bare wrapping row aligns to its first line.
    baseline: {
      true: { base: "items-baseline" },
      false: { base: "items-center" },
    },
    // A fixed column keeps every title on one x whatever the media's size.
    tightLeading: { false: { media: "min-h-10 min-w-10" } },
    data: {
      true: {
        body: "shrink-0",
        title: "text-[13px] leading-5 text-muted-fg",
        detail: "min-w-0 flex-1 leading-5 break-words text-fg",
      },
      false: {
        body: "min-w-0 flex-1",
        title: "text-sm font-medium text-fg",
        detail: "shrink-0 text-subtle-fg",
      },
    },
    wrap: {
      true: { title: "break-words" },
      false: { title: "block truncate" },
    },
  },
  defaultVariants: { intent: "neutral" },
});
</script>

<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { onClickOutside } from "runed";
import { cn, type VariantProps } from "../../utils/classes.ts";

type Props =
  & Omit<HTMLAttributes<HTMLDivElement>, "title">
  & Pick<VariantProps<typeof listItem>, "intent">
  & {
    /** A snippet title needs `titleText` to name the row's link. */
    title: string | Snippet;
    titleText?: string;
    meta?: string | Snippet;
    detail?: string | Snippet;
    /** A definition row: `title` is the muted label, `detail` the value; an empty value shows a dash. */
    data?: boolean;
    /** Makes the whole row a link; `actions` stay clickable above it. */
    href?: string;
    /** Shows the tint persistently; `href` rows also tint on hover. */
    tint?: boolean;
    /** Called on Escape or a press outside the tint, while `tint` is on. */
    ondismiss?: () => void;
    leading?: Snippet;
    badge?: Snippet;
    actions?: Snippet;
    /** Drops the 40px media column, for media far smaller than it (a dot). */
    tightLeading?: boolean;
    /** Wraps a long title instead of truncating it. */
    wrap?: boolean;
  };

let {
  title,
  titleText,
  meta,
  detail,
  data = false,
  href,
  intent,
  tint = false,
  ondismiss,
  leading,
  badge,
  actions,
  tightLeading = false,
  wrap = false,
  class: className,
  ...rest
}: Props = $props();

let row = $state<HTMLDivElement>();

const armed = $derived(tint && !!ondismiss);
const styles = $derived(
  listItem({
    intent,
    tinted: tint,
    link: !!href,
    baseline: wrap && !leading && !actions,
    tightLeading,
    data,
    wrap,
  }),
);

// runed tests DOM containment, but a press in the tint's bleed is still on the row.
onClickOutside(() => row, (event) => {
  if (!armed || !row || !("clientX" in event)) return;
  const rect = row.getBoundingClientRect();
  const inBleed = event.clientX >= rect.left - BLEED &&
    event.clientX <= rect.right + BLEED_END &&
    event.clientY >= rect.top - BLEED &&
    event.clientY <= rect.bottom + BLEED;
  if (!inBleed) ondismiss?.();
});
</script>

<svelte:window
  onkeydown={(event) => armed && event.key === "Escape" && ondismiss?.()}
/>

{#snippet text(value: string | Snippet)}
  {#if typeof value === "string"}{value}{:else}{@render value()}{/if}
{/snippet}

<div bind:this={row} class={cn(styles.base(), className)} {...rest}>
  <span class={styles.tint()} aria-hidden="true"></span>

  {#if leading}
    <span class={styles.media()}>{@render leading()}</span>
  {/if}

  <span class={styles.body()}>
    <span class={styles.title()}>{@render text(title)}</span>
    {#if meta}
      <span class={styles.meta()}>{@render text(meta)}</span>
    {/if}
  </span>

  {#if detail || data}
    <span class={styles.detail()}>{@render text(detail || "–")}</span>
  {/if}

  {#if badge}
    <span class="shrink-0">{@render badge()}</span>
  {/if}

  {#if actions}
    <span class="relative z-10 flex shrink-0 items-center gap-2">
      {@render actions()}
    </span>
  {/if}

  {#if href}
    <a
      {href}
      class="absolute inset-0 rounded-xl"
      aria-label={typeof title === "string" ? title : titleText}
    ></a>
  {/if}
</div>
