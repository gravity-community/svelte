<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const energyRange = ["2", "1", "0"] as const;

const badge = tv({
  slots: {
    base:
      "inline-flex items-center rounded-[2px] border border-transparent py-px font-mono font-semibold whitespace-nowrap uppercase",
    dot: "shrink-0 rounded-full",
  },
  variants: {
    energy: {
      "2": {},
      "1": { base: "bg-plate" },
      "0": {},
    },
    intent: {
      neutral: { base: "text-neutral-strong", dot: "bg-neutral-solid" },
      info: { base: "text-info-strong", dot: "bg-info-solid" },
      success: { base: "text-success-strong", dot: "bg-success-solid" },
      warning: { base: "text-warning-strong", dot: "bg-warning-solid" },
      danger: { base: "text-danger-strong", dot: "bg-danger-solid" },
    },
    size: {
      sm: {
        base: "gap-[5px] px-[5px] text-[10px] leading-[12px] tracking-[0.4px]",
        dot: "size-[3px]",
      },
      md: {
        base: "gap-[6px] px-[7px] text-[11px] leading-[14px] tracking-[0.44px]",
        dot: "size-[4px]",
      },
      lg: {
        base: "gap-[7px] px-[9px] text-[12px] leading-[16px] tracking-[0.48px]",
        dot: "size-[5px]",
      },
    },
    // Soft on a fill of its own intent, which the energy scope reports.
    onFill: { true: {} },
  },
  // deno-fmt-ignore
  compoundVariants: [
    { energy: "2", intent: "neutral", class: { base: "bg-neutral-subtle" } },
    { energy: "2", intent: "info", class: { base: "bg-info-subtle" } },
    { energy: "2", intent: "success", class: { base: "bg-success-subtle" } },
    { energy: "2", intent: "warning", class: { base: "bg-warning-subtle" } },
    { energy: "2", intent: "danger", class: { base: "bg-danger-subtle" } },
    { energy: "2", onFill: true, intent: "neutral", class: { base: "bg-neutral-deep" } },
    { energy: "2", onFill: true, intent: "info", class: { base: "bg-info-deep" } },
    { energy: "2", onFill: true, intent: "success", class: { base: "bg-success-deep" } },
    { energy: "2", onFill: true, intent: "warning", class: { base: "bg-warning-deep" } },
    { energy: "2", onFill: true, intent: "danger", class: { base: "bg-danger-deep" } },
  ],
  defaultVariants: { size: "sm" },
});
</script>

<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";
import { type Energy, resolveEnergy } from "../../utils/energy.ts";
import { getEnergyScope } from "../../utils/energy-scope.ts";

type Level = (typeof energyRange)[number];

type Props =
  & HTMLAttributes<HTMLSpanElement>
  & Pick<VariantProps<typeof badge>, "intent" | "size">
  & {
    energy?: Energy<Level>;
    dot?: boolean;
  };

let {
  energy,
  intent = "neutral",
  size,
  dot = false,
  class: className,
  children,
  ...rest
}: Props = $props();

const scope = getEnergyScope();
// A scope can be solid ("3"), above Badge's range; resolveEnergy clamps it to soft.
const level = $derived(
  resolveEnergy(
    energy ?? (scope()?.level as Energy<Level> | undefined),
    energyRange,
  ),
);
const onFill = $derived(level === "2" && scope()?.fill === intent);
const styles = $derived(badge({ energy: level, intent, size, onFill }));
</script>

<span class={cn(styles.base(), className)} {...rest}>
  {#if dot}<span class={styles.dot()} aria-hidden="true"></span>{/if}
  {@render children?.()}
</span>
