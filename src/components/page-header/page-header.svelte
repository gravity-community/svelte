<script module lang="ts">
import { tv } from "../../utils/classes.ts";

// Columns: back button, avatar, then the eyebrow and title together, so the
// eyebrow lines up with the title whatever leads it.
const pageHeader = tv({
  slots: {
    base: "grid w-full grid-cols-[auto_auto_minmax(0,1fr)] items-center",
    back: "col-start-1 me-1",
    // items-baseline: bottom-aligning the two type sizes leaves the subtitle 1px low.
    titleGroup: "col-start-3 flex min-w-0 items-baseline",
    // One line: the title truncates, so the subtitle always shows whole.
    title: "min-w-0 truncate font-sans text-fg",
    subtitle: "shrink-0 whitespace-nowrap text-subtle-fg lowercase",
    description: "col-span-full text-subtle-fg",
  },
  variants: {
    size: {
      sm: {
        base: "gap-y-1.5",
        back: "size-8",
        titleGroup: "gap-2",
        title: "text-heading",
        subtitle: "text-sm leading-5 font-medium",
        description: "text-xs leading-4",
      },
      md: {
        base: "gap-y-2",
        back: "size-10",
        titleGroup: "gap-2",
        title: "text-title",
        subtitle: "text-label",
        description: "text-sm leading-5",
      },
      lg: {
        base: "gap-y-3",
        back: "size-12",
        titleGroup: "gap-3",
        title: "text-title-xl tracking-[-0.01em]",
        subtitle: "text-title",
        description: "text-base leading-6",
      },
    },
  },
});
</script>

<script lang="ts">
import type { ComponentProps } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";
import Avatar from "../avatar/avatar.svelte";
import Button from "../button/button.svelte";
import Eyebrow from "../eyebrow/eyebrow.svelte";
import Icon from "../icon/icon.svelte";

type Props =
  & HTMLAttributes<HTMLDivElement>
  & VariantProps<typeof pageHeader>
  & {
    title: string;
    subtitle?: string;
    description?: string;
    eyebrow?: string;
    eyebrowIntent?: ComponentProps<typeof Eyebrow>["intent"];
    /** Shows the back button. */
    backHref?: string;
    /** The icon-only back button's name: the destination ("Users"), not the act. */
    backLabel?: string;
    /** Identity mark between the back button and the title. */
    avatar?: Pick<
      ComponentProps<typeof Avatar>,
      "userId" | "name" | "variant" | "organization" | "initials"
    >;
  };

let {
  title,
  subtitle,
  description,
  eyebrow,
  eyebrowIntent = "neutral",
  backHref,
  backLabel = "Back",
  avatar,
  size = "md",
  class: className,
  ...rest
}: Props = $props();

const styles = $derived(pageHeader({ size }));
</script>

<div class={cn(styles.base(), className)} {...rest}>
  {#if eyebrow}
    <Eyebrow intent={eyebrowIntent} class="col-start-3">{eyebrow}</Eyebrow>
  {/if}
  {#if backHref}
    <Button
      variant="ghost"
      intent="neutral"
      href={backHref}
      aria-label={backLabel}
      class={styles.back()}
    >
      {#snippet leadingIcon()}
        <Icon glyph="chevron-left" class="size-full" />
      {/snippet}
    </Button>
  {/if}
  {#if avatar}
    <Avatar {...avatar} {size} class="col-start-2 me-3" />
  {/if}
  <div class={styles.titleGroup()}>
    <h1 class={styles.title()}>{title}</h1>
    {#if subtitle}
      <span class={styles.subtitle()}>{subtitle}</span>
    {/if}
  </div>
  {#if description}
    <p class={styles.description()}>{description}</p>
  {/if}
</div>
