<script module lang="ts">
import { tv } from "../../utils/classes.ts";
import type { IconGlyph } from "../icon/glyphs.ts";

const energyRange = ["2", "1", "0"] as const;

const callout = tv({
  slots: {
    base: "flex items-start gap-3 rounded-xl px-4 py-3.5",
    icon: "mt-px flex size-5 shrink-0 items-center justify-center",
    title: "font-medium",
    actions: "mt-3 flex flex-wrap gap-2",
  },
  variants: {
    // Both boxes are filled wells, so the parts on them glaze. Ghost keeps the padding.
    energy: {
      "2": { base: "filled-well forced-colors:border", title: "text-fg" },
      "1": {
        base: "filled-well bg-plate forced-colors:border",
        title: "text-quiet-fg",
      },
      "0": { title: "text-quiet-fg" },
    },
    intent: { info: {}, warning: {} },
  },
  // deno-fmt-ignore
  compoundVariants: [
    { energy: "2", intent: "info", class: { base: "bg-info-subtle", icon: "text-info-strong" } },
    { energy: "2", intent: "warning", class: { base: "bg-warning-subtle", icon: "text-warning-strong" } },
    { energy: "1", intent: "info", class: { icon: "text-info-glyph-faint" } },
    { energy: "1", intent: "warning", class: { icon: "text-warning-glyph-faint" } },
    { energy: "0", intent: "info", class: { icon: "text-info-glyph-ghost" } },
    { energy: "0", intent: "warning", class: { icon: "text-warning-glyph-ghost" } },
  ],
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
import { type Energy, resolveEnergy } from "../../utils/energy.ts";
import { setEnergyScope } from "../../utils/energy-scope.ts";
import Icon from "../icon/icon.svelte";

type Props =
  & HTMLAttributes<HTMLDivElement>
  & Omit<VariantProps<typeof callout>, "energy">
  & {
    energy?: Energy<(typeof energyRange)[number]>;
    title?: string;
    /** Replaces the intent glyph. */
    icon?: Snippet;
    /** Buttons under the body; given no `energy`, they match the Callout's level. */
    actions?: Snippet;
    /** Announces the callout as it appears: `polite` once the screen reader is idle, `assertive` at once. */
    live?: "polite" | "assertive";
  };

let {
  intent = "info",
  energy,
  title,
  icon,
  actions,
  live,
  class: className,
  children,
  ...rest
}: Props = $props();

let registered = $state(false);

const level = $derived(resolveEnergy(energy, energyRange));
const styles = $derived(callout({ intent, energy: level }));

setEnergyScope(() => ({ level, fill: level === "2" ? intent : undefined }));

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
    {#if title}<p class={styles.title()}>{title}</p>{/if}
    <div class="text-muted-fg">{@render children?.()}</div>
    {#if actions}
      <div class={styles.actions()}>{@render actions()}</div>
    {/if}
  </div>
</div>
