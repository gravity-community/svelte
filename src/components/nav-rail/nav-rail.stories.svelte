<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import NavRail from "./nav-rail.svelte";
import type { NavRailItem, NavRailUser } from "./types.ts";

const states = ["collapsed", "expanded"] as const;

const items: NavRailItem[] = [
  { href: "#inbox", label: "Inbox", glyph: "archive", dot: true },
  { href: "#submissions", label: "Submissions", glyph: "files", active: true },
  { href: "#users", label: "Users", glyph: "users" },
  { href: "#network", label: "Network", glyph: "globe" },
  { href: "#settings", label: "Settings", glyph: "settings" },
];

const user: NavRailUser = {
  id: "8c4e1a70-3f92-4d65-b018-5a7c9e2f4b31",
  name: "Jordan Lee",
  role: "Administrator",
  avatarVariant: "mono",
};

const { Story } = defineMeta({
  title: "Navigation/NavRail",
  component: NavRail,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "App navigation: a rail on the left edge from lg up that springs open on hover or focus, and a bottom tab bar below lg.",
      },
    },
  },
  args: {
    items,
    user,
    logoutAction: "/logout",
    profileHref: "#profile",
    profileActive: false,
    open: false,
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <div class="relative h-[480px]">
      <NavRail {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="States"
  parameters={{ layout: "padded", controls: { disable: true } }}
>
  {#snippet template(args)}
    <Matrix rows={states}>
      {#snippet cell(state)}
        <div class="relative h-[480px] w-64">
          <NavRail {...args} open={state === "expanded"} />
        </div>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Profile link" parameters={{ controls: { disable: true } }}>
  {#snippet template(args)}
    <div class="relative h-[480px]">
      <NavRail {...args}>
        {#snippet identityWrap(identity)}
          <a href="#profile" class="contents">{@render identity()}</a>
        {/snippet}
      </NavRail>
    </div>
  {/snippet}
</Story>

<!-- Below lg the rail is a bottom tab bar, with a Profile tab when profileHref is set. -->
<Story
  name="Mobile"
  globals={{ viewport: { value: "mobile2", isRotated: false } }}
  parameters={{
    controls: { disable: true },
    // The bar is fixed to the viewport, so docs give the story its own frame.
    docs: { story: { inline: false, height: "240px" } },
  }}
>
  {#snippet template(args)}
    <NavRail {...args} />
  {/snippet}
</Story>
