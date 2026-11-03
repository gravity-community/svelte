<script module lang="ts">
import { tv } from "../../utils/classes.ts";

// On the inverse panel quiet controls take the inverse ghost: on-inverse ink and a glaze of it.
const codeBlock = tv({
  slots: {
    base: "flex w-full flex-col overflow-hidden rounded-2xl bg-surface-inverse",
    // pr-4 keeps the copy button's focus ring inside the panel's clip.
    header: "flex items-center gap-0.5 py-1.5 pr-4 pl-2 font-mono text-xs",
    tabs: "flex gap-0.5",
    label: "px-1.5 text-on-inverse",
    tab:
      "rounded-md px-1.5 py-0.5 text-on-inverse/60 transition-colors hover:bg-on-inverse/10 hover:text-on-inverse active:bg-on-inverse/15 data-[state=active]:bg-on-inverse/10 data-[state=active]:text-on-inverse data-[state=active]:hover:bg-on-inverse/15 data-[state=active]:active:bg-on-inverse/15 data-[state=active]:forced-colors:underline",
    copy:
      "flex size-5 shrink-0 items-center justify-center rounded-full text-on-inverse transition-colors hover:bg-on-inverse/10 active:bg-on-inverse/15",
  },
});
</script>

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
const styles = codeBlock();
</script>

{#snippet source(text: string)}
  <pre
  class="overflow-x-auto rounded-b-2xl p-4 focus-visible:-outline-offset-2"><code
      class="font-mono text-[13px] leading-5 text-on-inverse"
    >{text}</code></pre>
{/snippet}

<div class={cn(styles.base(), className)} {...rest}>
  <Tabs.Root
    value={active.label}
    onValueChange={(value) => (selected = value)}
    class="contents"
  >
    <div class={styles.header()}>
      {#if panes.length > 1}
        <Tabs.List class={styles.tabs()}>
          {#each panes as pane (pane.label)}
            <Tabs.Trigger value={pane.label} class={styles.tab()}>
              {pane.label}
            </Tabs.Trigger>
          {/each}
        </Tabs.List>
      {:else}
        <span class={styles.label()}>{active.label}</span>
      {/if}
      {#if copy}
        <button
          type="button"
          onclick={() => flash.copy(active.code)}
          aria-label={flash.copied() ? "Copied" : "Copy code"}
          class={styles.copy()}
        >
          <Icon glyph={flash.copied() ? "check" : "copy"} />
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
