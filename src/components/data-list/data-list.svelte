<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";
import { CopyFlash } from "../../utils/copy-flash.svelte.ts";
import Icon from "../icon/icon.svelte";
import type { DataListEntry } from "./types.ts";

type Props = HTMLAttributes<HTMLDivElement> & {
  /** Keyed by label; each non-empty value gets its own copy button. */
  entries: DataListEntry[];
  title?: string;
};

let { entries, title, class: className, ...rest }: Props = $props();

const flash = new CopyFlash();
</script>

<div
  class={cn("flex flex-col gap-3.5 rounded-xl bg-page-subtle p-4", className)}
  {...rest}
>
  {#if title}
    <span class="text-sm font-semibold text-fg">{title}</span>
  {/if}
  {#each entries as { label, value } (label)}
    {@const copied = flash.copied(label)}
    <div class="flex items-center justify-between gap-3">
      <div class="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span
          class="text-[11px] leading-[14px] font-semibold tracking-[0.66px] text-muted-fg uppercase"
        >{label}</span>
        <span class="truncate font-mono text-[13px] leading-5 text-fg">
          {value || "–"}
        </span>
      </div>
      {#if value}
        <button
          type="button"
          class="flex shrink-0 items-center gap-1 text-xs font-medium text-fg transition-colors hover:text-muted-fg"
          aria-label={`${copied ? "Copied" : "Copy"} ${label}`}
          onclick={() => flash.copy(value, label)}
        >
          <Icon glyph={copied ? "check" : "copy"} class="size-3.5" />
          {copied ? "Copied" : "Copy"}
        </button>
      {/if}
    </div>
  {/each}
</div>
