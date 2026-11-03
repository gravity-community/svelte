<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Header from "./header.svelte";

const { Story } = defineMeta({
  title: "Navigation/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Site header with the brand, route links from lg up, and below lg a menu toggle that opens NavDrawer.",
      },
    },
  },
  args: {
    homeHref: "#",
    links: [
      { href: "#product", label: "Product", active: true },
      { href: "#docs", label: "Docs" },
      { href: "#pricing", label: "Pricing" },
      { href: "#contact", label: "Contact" },
    ],
    showNav: true,
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Header {...args}>
      {#snippet brand()}gravity{/snippet}
    </Header>
  {/snippet}
</Story>

<!-- Below lg the links move into NavDrawer, which the menu toggle opens. -->
<Story
  name="Mobile"
  globals={{ viewport: { value: "mobile2", isRotated: false } }}
  parameters={{
    controls: { disable: true },
    // The open drawer locks scroll, so docs give the story its own frame.
    docs: { story: { inline: false, height: "480px" } },
  }}
>
  {#snippet template(args)}
    <Header {...args}>
      {#snippet brand()}gravity{/snippet}
    </Header>
  {/snippet}
</Story>
