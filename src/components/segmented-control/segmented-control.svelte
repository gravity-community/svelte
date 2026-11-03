<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const segmentedControl = tv({
  slots: {
    base:
      "group relative isolate items-center bg-surface-subtle forced-colors:border",
    // `isolate` keeps -z-10 local: the bar paints above the shell and below the labels.
    indicator:
      "pointer-events-none absolute top-0 left-0 -z-10 hidden bg-surface-selected group-data-placed:block forced-colors:border-2 forced-colors:border-[Highlight]",
    segment:
      "inline-flex items-center justify-center font-sans whitespace-nowrap no-underline transition-colors duration-150 select-none",
  },
  variants: {
    // The bar and the segment it covers share one radius per size.
    size: {
      md: {
        base: "gap-1.5 rounded-[10px] p-1",
        indicator: "rounded-lg",
        segment: "rounded-lg px-3 py-1.5 text-sm leading-5",
      },
      sm: {
        base: "gap-1 rounded-lg p-[3px]",
        indicator: "rounded-md",
        segment: "rounded-md px-2.5 py-1 text-xs leading-4",
      },
    },
    fill: {
      true: { base: "flex w-full", segment: "flex-1" },
      false: { base: "inline-flex" },
    },
    // Until the bar has a box to measure (no JS, display:none), the segment draws its own chip.
    selected: {
      true: {
        segment:
          "bg-surface-selected font-semibold text-fg group-data-placed:bg-transparent",
      },
      false: { segment: "font-medium text-subtle-fg hover:text-fg" },
    },
  },
  defaultVariants: { size: "md", fill: false, selected: false },
});
</script>

<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { ToggleGroup } from "bits-ui";
import { indicator } from "../../attachments/indicator/indicator.svelte.ts";
import { cn } from "../../utils/classes.ts";
import type { SegmentedControlItem, SegmentedControlSize } from "./types.ts";

type Props =
  & Omit<HTMLAttributes<HTMLDivElement>, "id" | "children" | "onselect">
  & {
    // bits-ui ids can't be null.
    id?: string;
    items: SegmentedControlItem[];
    /** The `value` (or `label`) of the selected segment. */
    value?: string;
    size?: SegmentedControlSize;
    /** Stretch to the container, the segments splitting it evenly. */
    fill?: boolean;
    /** Not called when the segments are links. */
    onselect?: (value: string) => void;
    ref?: HTMLElement | null;
  };

let {
  items,
  value,
  size,
  fill,
  onselect,
  ref = $bindable(null),
  class: className,
  ...rest
}: Props = $props();

const styles = $derived(segmentedControl({ size, fill }));
const asLinks = $derived(items.every((item) => item.href));

const keyOf = (item: SegmentedControlItem) => item.value ?? item.label;

// A single toggle group clears its value when the pressed item is pressed again.
function select(next: string) {
  if (next) onselect?.(next);
}
</script>

{#snippet bar()}
  <div data-indicator class={styles.indicator()} aria-hidden="true"></div>
{/snippet}

{#if asLinks}
  <div
  bind:this={ref}
  role="group"
  class={cn(styles.base(), className)}
  {@attach indicator(() => value)}
  {...rest}
>
    {@render bar()}
    {#each items as item (keyOf(item))}
      {@const key = keyOf(item)}
      <a
        href={item.href}
        data-key={key}
        aria-current={key === value ? "page" : undefined}
        class={styles.segment({ selected: key === value })}
      >
        {item.label}
      </a>
    {/each}
  </div>
{:else}
  <ToggleGroup.Root
  type="single"
  bind:value={() => value ?? "", select}
  bind:ref
  class={cn(styles.base(), className)}
  {@attach indicator(() => value)}
  {...rest}
>
    {@render bar()}
    {#each items as item (keyOf(item))}
      {@const key = keyOf(item)}
      <ToggleGroup.Item
        value={key}
        data-key={key}
        class={styles.segment({ selected: key === value })}
      >
        {item.label}
      </ToggleGroup.Item>
    {/each}
  </ToggleGroup.Root>
{/if}
