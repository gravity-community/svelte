<script module lang="ts">
import { tv } from "../../utils/classes.ts";
import type { IconGlyph } from "../icon/glyphs.ts";

const callout = tv({
  slots: {
    base: "flex items-start gap-3 rounded-xl px-4 py-3.5",
    icon: "mt-px flex size-5 shrink-0 items-center justify-center",
  },
  variants: {
    intent: {
      info: { base: "bg-info-subtle", icon: "text-info-strong" },
      warning: { base: "bg-warning-subtle", icon: "text-warning-strong" },
    },
  },
});

const glyphs = {
  info: "info-circle",
  warning: "warning",
} satisfies Record<string, IconGlyph>;

// Each role implies its aria-live and aria-atomic="true".
const roles = { polite: "status", assertive: "alert" } as const;

// Screen readers announce a status's changes, not what it holds as it appears
// (an alert's they do), so a polite callout's text joins its region once they
// have registered it: https://tetralogical.com/blog/2024/05/01/why-are-my-live-regions-not-working/
const REGISTER_DELAY = 100;
</script>

<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";
import Icon from "../icon/icon.svelte";

type Props = HTMLAttributes<HTMLDivElement> & VariantProps<typeof callout> & {
  title?: string;
  /** Replaces the intent glyph. */
  icon?: Snippet;
  /** Announces the callout as it appears: `polite` once the screen reader is idle, `assertive` at once. */
  live?: "polite" | "assertive";
};

let {
  intent = "info",
  title,
  icon,
  live,
  class: className,
  children,
  ...rest
}: Props = $props();

let registered = $state(false);

const styles = $derived(callout({ intent }));

$effect(() => {
  if (live !== "polite") return;
  const timer = setTimeout(() => (registered = true), REGISTER_DELAY);
  return () => clearTimeout(timer);
});
</script>

<div
  role={live && roles[live]}
  class={cn(styles.base(), className)}
  {...rest}
>
  <span class={styles.icon()} aria-hidden="true">
    {#if icon}
      {@render icon()}
    {:else}
      <Icon glyph={glyphs[intent]} class="size-full" />
    {/if}
  </span>
  <div
    class="flex min-w-0 flex-1 flex-col gap-[3px] text-[13px] leading-5"
    aria-hidden={live === "polite" && !registered ? "true" : undefined}
  >
    {#if title}<p class="font-medium text-fg">{title}</p>{/if}
    <div class="text-muted-fg">{@render children?.()}</div>
  </div>
</div>
