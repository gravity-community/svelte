<script lang="ts">
import type { Snippet } from "svelte";
import Avatar from "../avatar/avatar.svelte";
import Icon from "../icon/icon.svelte";
import type { NavRailUser } from "./types.ts";

type Props = {
  user: NavRailUser;
  identityWrap?: Snippet<[Snippet]>;
  logoutAction?: string;
};

let { user, identityWrap, logoutAction }: Props = $props();
</script>

<!-- Always the expanded layout: the rail's clipping collapses it to the avatar, and the tint shows only while expanded. -->
<div
  class="flex w-full items-center gap-2.5 rounded-xl p-2 transition-colors duration-[280ms] ease-in-out group-hover:bg-surface-subtle group-focus-within:bg-surface-subtle group-data-[open]:bg-surface-subtle min-[1600px]:bg-surface-subtle"
>
  {#snippet identity()}
    <Avatar
      userId={user.id}
      name={user.name}
      variant={user.avatarVariant}
      organization={user.organization}
      size="sm"
    />
    <div class="min-w-0 flex-1">
      <p class="truncate text-xs leading-4 font-medium text-fg">{user.name}</p>
      <p class="truncate text-xs leading-4 text-muted-fg">{user.role}</p>
    </div>
  {/snippet}

  {#if identityWrap}
    {@render identityWrap(identity)}
  {:else}
    {@render identity()}
  {/if}
  {#if logoutAction}
    <form method="POST" action={logoutAction} class="shrink-0">
      <button
        type="submit"
        aria-label="Log out"
        class="flex size-6 cursor-pointer items-center justify-center text-muted-fg hover:text-fg"
      >
        <Icon glyph="logout" class="size-full" />
      </button>
    </form>
  {/if}
</div>
