<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const separator = tv({
  base: "shrink-0 bg-border forced-colors:bg-[CanvasText]",
  variants: {
    orientation: {
      horizontal: "h-[0.5px] w-full",
      vertical: "w-[0.5px] self-stretch",
    },
  },
});
</script>

<script lang="ts">
import { Separator as SeparatorPrimitive } from "bits-ui";
import { cn } from "../../utils/classes.ts";

type Props = Omit<SeparatorPrimitive.RootProps, "child" | "children">;

let {
  orientation = "horizontal",
  ref = $bindable(null),
  class: className,
  ...rest
}: Props = $props();
</script>

<SeparatorPrimitive.Root
  bind:ref
  {orientation}
  class={cn(separator({ orientation }), className)}
  {...rest}
/>
