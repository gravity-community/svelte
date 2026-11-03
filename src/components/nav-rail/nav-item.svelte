<script module lang="ts">
import { tv } from "../../utils/classes.ts";

export const navItem = tv({
  slots: {
    base:
      "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[10px] px-1 py-1.5 transition-interactive lg:h-10 lg:w-full lg:flex-none lg:flex-row lg:justify-start lg:gap-3 lg:overflow-hidden lg:px-3 lg:py-2 focus-visible:-outline-offset-2",
    icon: "size-6",
    label:
      "text-center text-[10px] leading-3 font-medium whitespace-nowrap lg:text-left lg:text-xs lg:leading-4",
  },
  variants: {
    active: {
      true: {
        // A border, not an outline, so the focus ring still shows on top.
        base: "bg-primary-subtle forced-colors:border",
        icon: "text-primary-strong",
        label: "text-primary-strong",
      },
      false: {
        base: "hover:bg-page-subtle",
        icon: "text-muted-fg",
        label: "text-fg",
      },
    },
  },
});
</script>

<script lang="ts">
import Icon from "../icon/icon.svelte";
import { gravity } from "../../attachments/gravity/gravity.svelte.ts";
import type { NavRailItem } from "./types.ts";

type Props = NavRailItem;

let { href, label, glyph, active = false, dot = false }: Props = $props();

const styles = $derived(navItem({ active }));
</script>

<a
  {href}
  aria-current={active ? "page" : undefined}
  aria-label={dot ? `${label} (unread)` : undefined}
  class={styles.base()}
  {@attach gravity()}
>
  <span class="relative shrink-0">
    <Icon {glyph} class={styles.icon()} />
    {#if dot}
      <span
        class="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary-solid forced-colors:bg-[CanvasText]"
        aria-hidden="true"
      ></span>
    {/if}
  </span>
  <span class={styles.label()}>{label}</span>
</a>
