<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const sidePanel = tv({
  slots: {
    base: "flex h-full shrink-0 flex-col bg-surface",
    header: "flex items-start gap-3 border-b border-border-subtle px-5 py-4",
    title: "font-sans text-subheading break-words text-fg",
    subtitle: "mt-0.5 text-[13px] leading-5 text-muted-fg",
    body: "min-h-0 flex-1 overflow-y-auto p-5",
    footer:
      "flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-3",
  },
  variants: {
    side: {
      right: { base: "border-s border-border-subtle" },
      left: { base: "border-e border-border-subtle" },
    },
    size: { md: { base: "w-[360px]" }, lg: { base: "w-[440px]" } },
  },
  defaultVariants: { side: "right", size: "md" },
});
</script>

<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";

type Props =
  & Omit<HTMLAttributes<HTMLElement>, "title">
  & VariantProps<typeof sidePanel>
  & {
    title: string;
    /** A line under the title, or a snippet such as a breadcrumb. */
    subtitle?: string | Snippet;
    actions?: Snippet;
    /** Stays in view while the body scrolls. */
    footer?: Snippet;
  };

let {
  title,
  subtitle,
  actions,
  footer,
  side,
  size,
  class: className,
  children,
  ...rest
}: Props = $props();

const id = $props.id();
const styles = $derived(sidePanel({ side, size }));
</script>

<!-- Docked, not modal: it takes its parent's height and only the body scrolls. -->
<aside
  aria-labelledby="{id}-title"
  class={cn(styles.base(), className)}
  {...rest}
>
  <header class={styles.header()}>
    <div class="min-w-0 flex-1">
      <h2 id="{id}-title" class={styles.title()}>{title}</h2>
      {#if typeof subtitle === "string"}
        <p class={styles.subtitle()}>{subtitle}</p>
      {:else if subtitle}
        <div class={styles.subtitle()}>{@render subtitle()}</div>
      {/if}
    </div>
    {#if actions}
      <div class="flex shrink-0 items-center gap-1">{@render actions()}</div>
    {/if}
  </header>
  <div class={styles.body()}>
    {@render children?.()}
  </div>
  {#if footer}
    <footer class={styles.footer()}>{@render footer()}</footer>
  {/if}
</aside>
