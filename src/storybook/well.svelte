<script module lang="ts">
import { tv } from "../utils/classes.ts";

const well = tv({
  base: "filled-well rounded-2xl bg-well p-6",
  variants: {
    intent: {
      neutral: "bg-neutral-subtle",
      info: "bg-info-subtle",
      success: "bg-success-subtle",
      warning: "bg-warning-subtle",
      danger: "bg-danger-subtle",
    },
  },
});
</script>

<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../utils/classes.ts";

type Props = HTMLAttributes<HTMLDivElement> & VariantProps<typeof well>;

let { intent, class: className, children, ...rest }: Props = $props();
</script>

<!-- A filled well one level below the page: a grey card or an intent's tint. What it holds glazes; stories pass the decayed level by hand. -->
<div class={cn(well({ intent }), className)} {...rest}>
  {@render children?.()}
</div>
