import type { Decorator, Preview } from "@storybook/svelte";
import type { ArgTypesEnhancer } from "storybook/internal/types";
import { themes } from "storybook/theming";
import "../src/styles/storybook.css";

// Tokens follow prefers-color-scheme, so the docs theme does too. It's set
// once per load, so reload when the scheme changes.
const scheme = globalThis.matchMedia?.("(prefers-color-scheme: dark)");
scheme?.addEventListener("change", () => location.reload());

const withSurface: Decorator = (story) => {
  document.body.style.backgroundColor = "var(--gravity-surface-1)";
  return story();
};

// Svelte's docgen can't trace HTML attributes through bits-ui's nested Omits,
// so wrappers would list hundreds of them, given away by their `on:` and
// `bind:` keys. There, hide global attributes and DOM events unless the story
// sets them or the component requires them or gives them a default.
const globalAttributes = new Set(
  [Node, Element, HTMLElement]
    .flatMap((type) => Object.getOwnPropertyNames(type.prototype))
    // What svelte/elements adds, and the <button> form, popover and command
    // overrides, which no wrapper takes.
    .concat(
      `class style role about autosave color contextmenu datatype inlist is
      itemid itemprop itemref itemscope itemtype placeholder property radiogroup
      resource results security typeof unselectable vocab xmlns oncompositionend
      oncompositionstart oncompositionupdate ondragexit onencrypted onfocusin
      onfocusout ongamepadconnected ongamepaddisconnected onintroend
      onintrostart onmessage onmessageerror onoutroend onoutrostart
      ontouchcancel ontouchend ontouchmove ontouchstart onvisibilitychange
      formaction formenctype formmethod formnovalidate formtarget popovertarget
      popovertargetaction command commandfor`.split(/\s+/),
    )
    .map((name) => name.toLowerCase())
    .flatMap((name) => name.startsWith("on") ? [name, `${name}capture`] : name),
);

const hideGlobalAttributes: ArgTypesEnhancer = ({ argTypes, initialArgs }) => {
  if (!Object.keys(argTypes).some((name) => /^(bind|on):/.test(name))) {
    return argTypes;
  }
  return Object.fromEntries(
    Object.entries(argTypes).map(([name, argType]) => {
      const global = globalAttributes.has(name.toLowerCase()) ||
        /^(aria-|data-|bind:|on:)/.test(name);
      const shown = name in initialArgs || argType.type?.required ||
        argType.table?.defaultValue?.summary !== undefined;
      return [
        name,
        global && !shown
          ? { ...argType, table: { ...argType.table, disable: true } }
          : argType,
      ];
    }),
  );
};

const preview: Preview = {
  tags: ["autodocs"],
  decorators: [withSurface],
  argTypesEnhancers: [hideGlobalAttributes],
  parameters: {
    layout: "centered",
    backgrounds: { disable: true },
    docs: { theme: scheme?.matches ? themes.dark : themes.light },
    options: {
      storySort: {
        // Mirrors the page order of the Figma file.
        order: [
          "Getting started",
          "Changelog",
          "Foundations",
          [
            "Color",
            "Typography",
            "Spacing & layout",
            "Icons",
            "Motion & Gravity",
          ],
          "Actions",
          "Inputs",
          "Feedback",
          "Data display",
          "Navigation",
          "Overlays",
          "Layout",
          "Typography",
        ],
      },
    },
  },
};

export default preview;
