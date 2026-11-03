<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const energyRange = ["2", "1", "0"] as const;

const dataList = tv({
  slots: {
    base: "flex flex-col gap-3.5 rounded-xl border p-4",
    title: "text-sm font-semibold",
    value: "truncate font-mono text-[13px] leading-5",
  },
  variants: {
    // Values take the title's role, so both follow the level.
    energy: {
      "2": {
        base: "filled-well border-transparent bg-well",
        title: "text-fg",
        value: "text-fg",
      },
      "1": {
        base: "border-neutral-subtle",
        title: "text-quiet-fg",
        value: "text-quiet-fg",
      },
      "0": {
        base: "border-transparent",
        title: "text-quiet-fg",
        value: "text-quiet-fg",
      },
    },
  },
});
</script>

<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";
import { CopyFlash } from "../../utils/copy-flash.svelte.ts";
import { type Energy, resolveEnergy } from "../../utils/energy.ts";
import Button from "../button/button.svelte";
import Icon from "../icon/icon.svelte";
import type { DataListEntry } from "./types.ts";

type Props = HTMLAttributes<HTMLDivElement> & {
  energy?: Energy<(typeof energyRange)[number]>;
  /** Keyed by label; each non-empty value gets its own copy button. */
  entries: DataListEntry[];
  title?: string;
};

let { energy, entries, title, class: className, ...rest }: Props = $props();

const level = $derived(resolveEnergy(energy, energyRange));
const styles = $derived(dataList({ energy: level }));

const flash = new CopyFlash();
</script>

<div class={cn(styles.base(), className)} {...rest}>
  {#if title}
    <span class={styles.title()}>{title}</span>
  {/if}
  {#each entries as { label, value } (label)}
    {@const copied = flash.copied(label)}
    <div class="flex items-center justify-between gap-3">
      <div class="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span
          class="text-[11px] leading-[14px] font-semibold tracking-[0.66px] text-muted-fg uppercase"
        >{label}</span>
        <span class={styles.value()}>{value || "–"}</span>
      </div>
      {#if value}
        <!-- A quiet control: fixed at ghost neutral, whatever the level. -->
        <Button
          type="button"
          energy="0"
          intent="neutral"
          size="sm"
          gravity={false}
          aria-label={`${copied ? "Copied" : "Copy"} ${label}`}
          onclick={() => flash.copy(value, label)}
        >
          {#snippet leadingIcon()}
            <Icon glyph={copied ? "check" : "copy"} class="size-full" />
          {/snippet}
          {copied ? "Copied" : "Copy"}
        </Button>
      {/if}
    </div>
  {/each}
</div>
