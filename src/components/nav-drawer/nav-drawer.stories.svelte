<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import { fn } from "storybook/test";
import NavDrawer from "./nav-drawer.svelte";

const { Story } = defineMeta({
  title: "Overlays/NavDrawer",
  component: NavDrawer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Full-screen menu of Header's links below lg, built on bits-ui Dialog.",
      },
      // An open Dialog locks scroll and pointer events, so docs give the drawer its own frame.
      story: { inline: false, height: "480px" },
    },
  },
  // The drawer stays closed from lg up.
  globals: { viewport: { value: "mobile2", isRotated: false } },
  args: {
    open: true,
    links: [
      { href: "#product", label: "Product", active: true },
      { href: "#docs", label: "Docs" },
      { href: "#pricing", label: "Pricing" },
      { href: "#contact", label: "Contact" },
    ],
    onOpenChange: fn(),
  },
});
</script>

<Story name="Playground" />
