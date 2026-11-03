<script module lang="ts">
// The stroke ignores the scale, so the round caps stay round as a bar grows.
const bar =
  "[transform-box:fill-box] [vector-effect:non-scaling-stroke] origin-center transition-transform duration-300 ease-in-out motion-reduce:transition-none";
</script>

<script lang="ts">
import type { HTMLButtonAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";

type Props = HTMLButtonAttributes & { open: boolean };

let { open, class: className, ...rest }: Props = $props();
</script>

<button
  type="button"
  aria-expanded={open}
  aria-label={open ? "Close menu" : "Open menu"}
  class={cn("flex size-6 shrink-0 items-center justify-center text-fg", className)}
  {...rest}
>
  <!-- GLYPHS.fries (Figma 109:701) morphing into Figma's X: each outer bar moves its centre to (12,12), turns ±45° and scales to 28 units; the middle bar fades. Recompute if the glyph changes. -->
  <svg
    class="size-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <line
      x1="13"
      y1="4"
      x2="21"
      y2="4"
      class={[bar, open && "-translate-x-[5px] translate-y-[8px] rotate-45 scale-x-[3.5]"]}
    />
    <line
      x1="3"
      y1="12"
      x2="21"
      y2="12"
      class={[
        "transition-opacity duration-200 ease-in-out motion-reduce:transition-none",
        open && "opacity-0",
      ]}
    />
    <line
      x1="9"
      y1="20"
      x2="21"
      y2="20"
      class={[bar, open && "-translate-x-[3px] -translate-y-[8px] -rotate-45 scale-x-[calc(28/12)]"]}
    />
  </svg>
</button>
