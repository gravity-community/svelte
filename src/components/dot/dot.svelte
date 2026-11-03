<script module lang="ts">
import { tv } from "../../utils/classes.ts";
import type { DotIntent } from "./types.ts";

// Hue carries the meaning, filled vs hollow the state.
const dot = tv({
  base:
    "inline-block size-2 shrink-0 rounded-full border-[1.5px] border-current",
  variants: {
    intent: {
      neutral: "text-neutral-solid",
      info: "text-info-solid",
      success: "text-success-solid",
      warning: "text-warning-solid",
      danger: "text-danger-solid",
    } satisfies Record<DotIntent, string>,
    filled: { true: "bg-current forced-colors:bg-[CanvasText]" },
  },
  defaultVariants: { intent: "neutral" },
});
</script>

<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";

type Props = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof dot>;

let { intent, filled, class: className, ...rest }: Props = $props();
</script>

<!-- Decorative: callers that need the state announced say it in their own text. -->
<span
  class={cn(dot({ intent, filled }), className)}
  aria-hidden="true"
  {...rest}
></span>
