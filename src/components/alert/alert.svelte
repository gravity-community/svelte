<script module lang="ts">
import { tv } from "../../utils/classes.ts";
import type { IconGlyph } from "../icon/glyphs.ts";

const energyRange = ["2", "1", "0"] as const;

const alert = tv({
  slots: {
    base: "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm",
    icon: "size-4 shrink-0",
  },
  variants: {
    // Both boxes are filled wells. Ghost keeps the padding; it is {}, not "",
    // since a string value lists ghost first in Storybook's props table.
    energy: {
      "2": { base: "filled-well forced-colors:border" },
      "1": { base: "filled-well bg-plate forced-colors:border" },
      "0": {},
    },
    // The message keeps the strong ink at every level; the icon steps down.
    intent: {
      danger: { base: "text-danger-strong" },
      success: { base: "text-success-strong" },
      info: { base: "text-info-strong" },
      warning: { base: "text-warning-strong" },
    },
  },
  // deno-fmt-ignore
  compoundVariants: [
    { energy: "2", intent: "danger", class: { base: "bg-danger-subtle" } },
    { energy: "2", intent: "success", class: { base: "bg-success-subtle" } },
    { energy: "2", intent: "info", class: { base: "bg-info-subtle" } },
    { energy: "2", intent: "warning", class: { base: "bg-warning-subtle" } },
    { energy: "1", intent: "danger", class: { icon: "text-danger-glyph-faint" } },
    { energy: "1", intent: "success", class: { icon: "text-success-glyph-faint" } },
    { energy: "1", intent: "info", class: { icon: "text-info-glyph-faint" } },
    { energy: "1", intent: "warning", class: { icon: "text-warning-glyph-faint" } },
    { energy: "0", intent: "danger", class: { icon: "text-danger-glyph-ghost" } },
    { energy: "0", intent: "success", class: { icon: "text-success-glyph-ghost" } },
    { energy: "0", intent: "info", class: { icon: "text-info-glyph-ghost" } },
    { energy: "0", intent: "warning", class: { icon: "text-warning-glyph-ghost" } },
  ],
});

const glyphs = {
  danger: "cross-full",
  success: "check-full",
  info: "info-circle",
  warning: "warning",
} satisfies Record<string, IconGlyph>;
</script>

<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";
import { type Energy, resolveEnergy } from "../../utils/energy.ts";
import { setEnergyScope } from "../../utils/energy-scope.ts";
import Button from "../button/button.svelte";
import Icon from "../icon/icon.svelte";

type Props =
  & HTMLAttributes<HTMLDivElement>
  & Omit<VariantProps<typeof alert>, "energy">
  & {
    energy?: Energy<(typeof energyRange)[number]>;
    /** Shows a Dismiss button that calls it. */
    onclose?: () => void;
  };

let {
  intent = "danger",
  energy,
  onclose,
  class: className,
  children,
  ...rest
}: Props = $props();

const level = $derived(resolveEnergy(energy, energyRange));
const styles = $derived(alert({ intent, energy: level }));

setEnergyScope(() => ({ level, fill: level === "2" ? intent : undefined }));
</script>

<div
  role={intent === "danger" ? "alert" : undefined}
  class={cn(styles.base(), className)}
  {...rest}
>
  <Icon glyph={glyphs[intent]} class={styles.icon()} />
  <span>{@render children?.()}</span>
  {#if onclose}
    <!-- The negative margins keep the Alert one line tall. -->
    <Button
      energy="0"
      intent="neutral"
      size="sm"
      gravity={false}
      aria-label="Dismiss"
      class="ms-auto -my-2 -me-1.5"
      onclick={onclose}
    >
      {#snippet leadingIcon()}
        <Icon glyph="cross" class="size-full" />
      {/snippet}
    </Button>
  {/if}
</div>
