<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const spinner = tv({
  base: "animate-spin",
  variants: { size: { sm: "size-4", md: "size-5", lg: "size-6" } },
  defaultVariants: { size: "sm" },
});
</script>

<script lang="ts">
import type { SVGAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";
import Icon from "../icon/icon.svelte";

type Props = SVGAttributes<SVGSVGElement> & VariantProps<typeof spinner>;

let { size, class: className, ...rest }: Props = $props();
</script>

<Icon glyph="spinner" class={cn(spinner({ size }), className)} {...rest} />
