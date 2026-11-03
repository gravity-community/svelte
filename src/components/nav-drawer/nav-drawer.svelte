<script lang="ts">
import { Dialog } from "bits-ui";
import { MediaQuery } from "svelte/reactivity";
import { fade } from "svelte/transition";
import { cn } from "../../utils/classes.ts";
import type { HeaderLink } from "../header/types.ts";

type Props =
  & Omit<Dialog.ContentProps, "child" | "children" | "forceMount" | "ref">
  & {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    links: HeaderLink[];
  };

let {
  open = $bindable(false),
  onOpenChange,
  links,
  class: className,
  ...rest
}: Props = $props();

// Closed from lg up: an open Dialog keeps the body scroll- and pointer-locked.
const wide = new MediaQuery("(min-width: 64rem)");

let content = $state<HTMLElement | null>(null);

function close(): void {
  open = false;
  onOpenChange?.(false);
}
</script>

<Dialog.Root
  bind:open={() => open && !wide.current, (next) => (open = next)}
  {onOpenChange}
>
  <!-- Not portalled: Header's logo and toggle (z-20) stay above it and the toggle closes it, hence "ignore". pt matches Header's height. -->
  <Dialog.Content
    {...rest}
    forceMount
    bind:ref={content}
    aria-label="Menu"
    interactOutsideBehavior="ignore"
    onOpenAutoFocus={(event) => {
      event.preventDefault();
      content?.focus();
    }}
    class={cn(
      "fixed inset-0 z-10 flex flex-col bg-surface pt-[92px] outline-none lg:hidden",
      className,
    )}
  >
    {#snippet child({ props, open })}
      {#if open}
        <div {...props} transition:fade={{ duration: 150 }}>
          <nav class="flex flex-1 flex-col justify-center gap-1 px-8">
            {#each links as link (link.href)}
              <a
                href={link.href}
                aria-current={link.active ? "page" : undefined}
                onclick={close}
                class={[
                  "border-b border-border py-4 text-2xl",
                  link.active
                    ? "font-display font-semibold text-fg"
                    : "font-sans font-normal text-muted-fg",
                ]}
              >
                {link.label}
              </a>
            {/each}
          </nav>
        </div>
      {/if}
    {/snippet}
  </Dialog.Content>
</Dialog.Root>
