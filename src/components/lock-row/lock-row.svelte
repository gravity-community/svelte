<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";
import Icon from "../icon/icon.svelte";

type Props = HTMLAttributes<HTMLDivElement> & { label: string };

let { label, class: className, ...rest }: Props = $props();
</script>

<!-- A field redacted by access tier: shown quietly rather than hidden. -->
<div
  class={cn("flex items-center gap-2 py-1 text-subtle-fg", className)}
  {...rest}
>
  <Icon glyph="lock" class="size-3.5 shrink-0" />
  <span class="text-[13px] leading-5 whitespace-nowrap">{label}</span>
</div>
