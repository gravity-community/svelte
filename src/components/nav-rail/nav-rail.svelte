<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";
import { expand } from "../../attachments/expand/expand.svelte.ts";
import Avatar from "../avatar/avatar.svelte";
import NavItem, { navItem } from "./nav-item.svelte";
import NavUser from "./nav-user.svelte";
import type { NavRailItem, NavRailUser } from "./types.ts";

type Props = HTMLAttributes<HTMLElement> & {
  items: NavRailItem[];
  user: NavRailUser;
  /** Logout form action; without it there is no logout button. */
  logoutAction?: string;
  /** Own-profile link for the mobile Profile tab; without it there is no tab. */
  profileHref?: string;
  profileActive?: boolean;
  /** Wraps the footer's avatar and name, e.g. in a profile link. The wrapper must be `display: contents`. */
  identityWrap?: Snippet<[Snippet]>;
  /** Pins the rail expanded at `lg` and up. */
  open?: boolean;
};

let {
  items,
  user,
  logoutAction,
  profileHref,
  profileActive = false,
  identityWrap,
  open = false,
  class: className,
  ...rest
}: Props = $props();

const profile = $derived(navItem({ active: profileActive }));
</script>

<!--
  Below lg: a fixed bottom bar, z-40 over page content; Header (z-50) and its NavDrawer stay above it.
  At lg+: a rail over a w-16 layout gutter that springs open on hover or focus; collapsed, it clips its labels.
-->
<nav
  class={cn(
    "group fixed right-0 bottom-0 left-0 z-40 flex h-16 flex-row items-stretch justify-between overflow-hidden border-t border-border-subtle bg-surface px-2 py-1.5",
    "lg:absolute lg:inset-y-0 lg:right-auto lg:h-full lg:w-16 lg:flex-col lg:border-t-0 lg:py-4 lg:min-[1600px]:w-64",
    className,
  )}
  data-open={open || undefined}
  {@attach expand(() => ({ open, disableBelow: "64rem" }))}
  {...rest}
>
  <div
    class="flex flex-1 flex-row items-stretch gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-none lg:flex-col lg:gap-2 lg:overflow-visible"
  >
    {#each items as item (item.href)}
      <NavItem {...item} />
    {/each}
    {#if profileHref}
      <a
        href={profileHref}
        aria-current={profileActive ? "page" : undefined}
        class={profile.base({ class: "lg:hidden" })}
      >
        <Avatar
          userId={user.id}
          name={user.name}
          variant={user.avatarVariant}
          organization={user.organization}
          size="sm"
        />
        <span class={profile.label()}>Profile</span>
      </a>
    {/if}
  </div>

  <div class="hidden lg:flex">
    <NavUser {user} {identityWrap} {logoutAction} />
  </div>
</nav>
