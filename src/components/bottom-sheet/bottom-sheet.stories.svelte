<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import type { ComponentProps } from "svelte";
import Matrix from "../../storybook/matrix.svelte";
import { NAV_RAIL_BAR_HEIGHT } from "../nav-rail/types.ts";
import BottomSheet from "./bottom-sheet.svelte";

type Args = Omit<ComponentProps<typeof BottomSheet>, "children">;

const states = ["peek", "expanded"] as const;

const { Story } = defineMeta({
  title: "Overlays/BottomSheet",
  component: BottomSheet,
  parameters: {
    docs: {
      description: {
        component:
          "Draggable mobile sheet that rests at a peek height over the page and expands into a scrollable dialog.",
      },
    },
  },
  args: {
    expanded: false,
    peekHeight: 132,
    expandedHeight: 460,
    bottomInset: 0,
    label: "Ownership summary",
    scrim: true,
  },
});
</script>

<script lang="ts">
let taps = $state(0);
</script>

<!-- translate-x-0 makes the phone frame the containing block for the sheet's fixed position. -->
{#snippet phone(args: Args, rows: number, tabBar = false)}
  <div
  class="relative h-[720px] w-[402px] translate-x-0 overflow-hidden rounded-[24px] border border-border bg-page-subtle"
>
    <div class="absolute inset-0 overflow-y-auto px-6 py-5 pb-[150px]">
      <p
        class="pb-3 text-[11px] leading-[14px] font-semibold tracking-[0.66px] text-subtle-fg uppercase"
      >
        Page behind · {taps} taps
      </p>
      {#each Array.from({ length: 14 }, (_, i) => i + 1) as n (n)}
        <button
          type="button"
          class="flex w-full items-center justify-between border-b border-border-subtle py-3 text-left hover:bg-page-subtle"
          onclick={() => taps++}
        >
          <span class="text-sm leading-5 text-fg">Background row {n}</span>
          <span class="text-xs leading-4 text-subtle-fg">tap me</span>
        </button>
      {/each}
    </div>
    {#if tabBar}
      <nav
        class="absolute inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border-subtle bg-surface px-2"
        aria-label="Admin"
      >
        {#each ["Registry", "Submissions", "Inbox", "Users", "Profile"] as tab (tab)}
          <span class="text-[10px] leading-3 font-medium text-fg">{tab}</span>
        {/each}
      </nav>
    {/if}
    <BottomSheet {...args}>
      <div class="flex flex-col px-6 pb-8">
        <p
          class="pb-3 text-[11px] leading-[14px] font-semibold tracking-[0.66px] text-subtle-fg uppercase"
        >
          Ownership summary
        </p>
        {#each Array.from({ length: rows }, (_, i) => i + 1) as n (n)}
          <div
            class="flex items-center justify-between border-b border-border-subtle py-3"
          >
            <span class="text-sm leading-5 text-fg">Subject {n}</span>
            <span class="font-mono text-xs leading-4 text-subtle-fg">25%</span>
          </div>
        {/each}
      </div>
    </BottomSheet>
  </div>
{/snippet}

<!-- At peek the page behind stays interactive; only the visible strip takes the pointer. -->
<Story name="Playground">
  {#snippet template(args)}
    {@render phone(args, 8)}
  {/snippet}
</Story>

<!-- Dragging down from the top of the expanded list hands the gesture back to the sheet. -->
<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template(args)}
    <Matrix rows={states}>
      {#snippet cell(state)}
        {#if state === "expanded"}
          {@render phone({ ...args, expanded: true }, 30)}
        {:else}
          {@render phone(args, 8)}
        {/if}
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Detail page: the sheet (z-45) covers the z-40 tab bar, peek included. -->
<Story name="Over tab bar" parameters={{ controls: { disable: true } }}>
  {#snippet template(args)}
    {@render phone(args, 8, true)}
  {/snippet}
</Story>

<!-- bottomInset keeps the tab bar visible and reachable; the sheet is then non-modal. -->
<Story
  name="Above tab bar"
  args={{ bottomInset: NAV_RAIL_BAR_HEIGHT }}
  parameters={{ controls: { disable: true } }}
>
  {#snippet template(args)}
    {@render phone(args, 8, true)}
  {/snippet}
</Story>
