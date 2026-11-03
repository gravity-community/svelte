<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const progress = tv({
  slots: {
    base: "flex w-full flex-col gap-1.5",
    labels: "flex items-baseline gap-3 text-[13px] leading-5",
    label: "min-w-0 truncate font-medium text-fg",
    value: "ms-auto shrink-0 text-muted-fg tabular-nums",
    track: "flex w-full",
    fill: "h-full rounded-full forced-colors:bg-[Highlight]",
    empty: "h-full flex-1 rounded-full bg-surface-muted forced-colors:border",
  },
  variants: {
    intent: {
      primary: { fill: "bg-primary-solid" },
      info: { fill: "bg-info-solid" },
      success: { fill: "bg-success-solid" },
      warning: { fill: "bg-warning-solid" },
      danger: { fill: "bg-danger-solid" },
    },
    size: { sm: { track: "h-1" }, md: { track: "h-2" } },
    segmented: {
      true: { track: "gap-1", fill: "flex-1" },
      false: {
        track:
          "overflow-hidden rounded-full bg-surface-muted forced-colors:border",
        fill:
          "transition-[width] duration-300 ease-out motion-reduce:transition-none",
      },
    },
  },
  defaultVariants: { intent: "primary", size: "sm" },
});
</script>

<script lang="ts">
import { Progress as ProgressPrimitive } from "bits-ui";
import { cn, type VariantProps } from "../../utils/classes.ts";

type Props =
  & Omit<ProgressPrimitive.RootProps, "child" | "children" | "value">
  & Pick<VariantProps<typeof progress>, "intent" | "size">
  & {
    value?: number;
    /** Names the progressbar; without it, pass aria-label. */
    label?: string;
    /**
     * The value as text, such as "3 of 5 layers"; screen readers read it instead of the number.
     * Show it wherever the exact value matters: on the muted track the light warning fill (2.72:1)
     * and the dark primary fill (2.31:1) fall below 3:1.
     */
    valueLabel?: string;
    /** One segment per unit from `min` to `max`, filled up to `value`; suits a handful of units, such as a `max` of 5. */
    segmented?: boolean;
  };

let {
  value = 0,
  min = 0,
  max = 100,
  label,
  valueLabel,
  segmented = false,
  intent,
  size,
  ref = $bindable(null),
  class: className,
  ...rest
}: Props = $props();

const id = $props.id();
const styles = $derived(progress({ intent, size, segmented }));
const span = $derived(Math.max(max - min, 0));
const done = $derived(Math.min(Math.max(value - min, 0), span));
</script>

<!-- The labels sit inside the progressbar, whose children screen readers skip; aria-labelledby and aria-valuetext carry them. -->
<ProgressPrimitive.Root
  bind:ref
  {value}
  {min}
  {max}
  aria-labelledby={label ? `${id}-label` : undefined}
  aria-valuetext={valueLabel}
  class={cn(styles.base(), className)}
  {...rest}
>
  {#if label || valueLabel}
    <div class={styles.labels()}>
      {#if label}
        <span id="{id}-label" class={styles.label()}>{label}</span>
      {/if}
      {#if valueLabel}
        <span class={styles.value()}>{valueLabel}</span>
      {/if}
    </div>
  {/if}
  <div class={styles.track()}>
    {#if segmented}
      {#each { length: span }, index (index)}
        <span class={index < Math.round(done) ? styles.fill() : styles.empty()}>
        </span>
      {/each}
    {:else}
      <span
        class={styles.fill()}
        style:width="{span ? (done / span) * 100 : 0}%"
      ></span>
    {/if}
  </div>
</ProgressPrimitive.Root>
