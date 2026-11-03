<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";
import MenuToggle from "../menu-toggle/menu-toggle.svelte";
import NavDrawer from "../nav-drawer/nav-drawer.svelte";
import type { HeaderLink } from "./types.ts";

type Props = HTMLAttributes<HTMLElement> & {
  brand: Snippet;
  homeHref?: string;
  links?: HeaderLink[];
  showNav?: boolean;
};

let {
  brand,
  homeHref = "/",
  links = [],
  showNav = true,
  class: className,
  ...rest
}: Props = $props();

let menuOpen = $state(false);
</script>

<header
  class={cn(
    "relative z-50 grid h-[92px] w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center bg-surface",
    className,
  )}
  {...rest}
>
  <!-- Logo and toggle sit above the open drawer, whose scroll lock sets pointer-events: none on body. -->
  <a
    href={homeHref}
    class="pointer-events-auto relative z-20 justify-self-start font-display text-2xl leading-none text-fg"
  >
    {@render brand()}
  </a>

  {#if showNav && links.length}
    <nav
      class="col-start-2 hidden items-center gap-8 text-sm whitespace-nowrap text-muted-fg lg:flex"
    >
      {#each links as link (link.href)}
        <a
          href={link.href}
          aria-current={link.active ? "page" : undefined}
          class={[
            "hover:text-fg",
            link.active ? "font-display font-semibold" : "font-sans font-normal",
          ]}
        >
          {link.label}
        </a>
      {/each}
    </nav>

    <MenuToggle
      open={menuOpen}
      onclick={() => (menuOpen = !menuOpen)}
      class="pointer-events-auto relative z-20 col-start-3 justify-self-end lg:hidden"
    />

    <NavDrawer {links} bind:open={menuOpen} />
  {/if}
</header>
