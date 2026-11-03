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
};

let {
  intent = "info",
  title,
  icon,
  class: className,
  children,
  ...rest
}: Props = $props();

const styles = $derived(callout({ intent }));
</script>

<div class={cn(styles.base(), className)} {...rest}>
  <span class={styles.icon()} aria-hidden="true">
    {#if icon}
      {@render icon()}
    {:else}
      <Icon glyph={glyphs[intent]} class="size-full" />
    {/if}
  </span>
  <div class="flex min-w-0 flex-1 flex-col gap-[3px] text-[13px] leading-5">
    {#if title}<p class="font-medium text-fg">{title}</p>{/if}
    <div class="text-muted-fg">{@render children?.()}</div>
  </div>
</div>
