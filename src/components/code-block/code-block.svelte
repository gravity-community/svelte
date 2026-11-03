<script lang="ts">
import { Tabs } from "bits-ui";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";
import { CopyFlash } from "../../utils/copy-flash.svelte.ts";
import Icon from "../icon/icon.svelte";
import type { CodeBlockTab } from "./types.ts";

type Props = HTMLAttributes<HTMLDivElement> & {
  /** One pane per language or shell; takes precedence over `code`. */
  tabs?: CodeBlockTab[];
  code?: string;
  label?: string;
  copy?: boolean;
};

let {
  tabs,
  code = "",
  label = "code",
  copy = true,
  class: className,
  ...rest
}: Props = $props();

let selected = $state<string>();

const panes = $derived(tabs?.length ? tabs : [{ label, code }]);
const active = $derived(
  panes.find((pane) => pane.label === selected) ?? panes[0],
);
const flash = new CopyFlash();
</script>

{#snippet source(text: string)}
  <pre
  class="overflow-x-auto rounded-b-2xl p-4 focus-visible:-outline-offset-2"><code
      class="font-mono text-[13px] leading-5 text-on-inverse"
    >{text}</code></pre>
{/snippet}

<div
  class={cn(
    "flex w-full flex-col overflow-hidden rounded-2xl bg-surface-inverse",
    className,
  )}
  {...rest}
>
  <Tabs.Root
    value={active.label}
    onValueChange={(value) => (selected = value)}
    class="contents"
  >
    <div class="flex items-center gap-2.5 py-2 pr-3 pl-3.5 font-mono text-xs">
      {#if panes.length > 1}
        <Tabs.List class="flex gap-3.5">
          {#each panes as pane (pane.label)}
            <Tabs.Trigger
              value={pane.label}
              class="text-on-inverse/60 hover:text-on-inverse data-[state=active]:text-on-inverse data-[state=active]:forced-colors:underline"
            >
              {pane.label}
            </Tabs.Trigger>
          {/each}
        </Tabs.List>
      {:else}
        <span class="text-on-inverse">{active.label}</span>
      {/if}
      {#if copy}
        <button
          type="button"
          onclick={() => flash.copy(active.code)}
          aria-label={flash.copied() ? "Copied" : "Copy code"}
          class="size-4 shrink-0 text-on-inverse/60 transition-colors hover:text-on-inverse"
        >
          <Icon glyph={flash.copied() ? "check" : "copy"} class="size-full" />
        </button>
      {/if}
    </div>
    <div class="h-px w-full bg-on-inverse"></div>
    {#if panes.length > 1}
      {#each panes as pane (pane.label)}
        <Tabs.Content value={pane.label} class="rounded-b-2xl focus-visible:-outline-offset-2">
          {@render source(pane.code)}
        </Tabs.Content>
      {/each}
    {:else}
      {@render source(active.code)}
    {/if}
  </Tabs.Root>
</div>
