<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const container = tv({
  base: "mx-auto w-full",
  variants: {
    size: {
      xs: "max-w-[400px]",
      sm: "max-w-[480px]",
      md: "max-w-[560px]",
      lg: "max-w-[720px]",
      xl: "max-w-[960px]",
      full: "max-w-none",
    },
  },
});
</script>

<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";

type Props =
  & HTMLAttributes<HTMLDivElement>
  & Required<VariantProps<typeof container>>;

let { size, class: className, children, ...rest }: Props = $props();
</script>

<div class={cn(container({ size }), className)} {...rest}>
  {@render children?.()}
</div>
