<script module lang="ts">
import { tv } from "../../utils/classes.ts";
import type { IconGlyph } from "../icon/glyphs.ts";

const alert = tv({
  base: "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm",
  variants: {
    intent: {
      danger: "bg-danger-subtle text-danger-strong",
      success: "bg-success-subtle text-success-strong",
      info: "bg-info-subtle text-info-strong",
      warning: "bg-warning-subtle text-warning-strong",
    },
  },
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
import Icon from "../icon/icon.svelte";

type Props = HTMLAttributes<HTMLDivElement> & VariantProps<typeof alert>;

let {
  intent = "danger",
  class: className,
  children,
  ...rest
}: Props = $props();
</script>

<div
  role={intent === "danger" ? "alert" : undefined}
  class={cn(alert({ intent }), className)}
  {...rest}
>
  <Icon glyph={glyphs[intent]} class="size-4 shrink-0" />
  <span>{@render children?.()}</span>
</div>
