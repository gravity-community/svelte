<script lang="ts">
import type { ComponentProps } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";
import Avatar from "../avatar/avatar.svelte";

type Props =
  & HTMLAttributes<HTMLSpanElement>
  & Pick<
    ComponentProps<typeof Avatar>,
    "name" | "userId" | "variant" | "initials"
  >;

let { name, userId, variant, initials, class: className, ...rest }: Props =
  $props();
</script>

<span
  class={cn(
    "inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-surface py-1 pr-2.5 pl-[5px]",
    className,
  )}
  {...rest}
>
  <!-- Always a circle: a chip names an account, never an organization as such. -->
  <Avatar {name} {userId} {variant} {initials} size="xs" shape="circle" />
  <span class="min-w-0 truncate text-xs leading-4 font-medium text-fg">
    {name}
  </span>
</span>
