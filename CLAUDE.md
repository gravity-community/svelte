# CLAUDE.md

## Design source of truth

The official Figma project for Gravity is:
https://www.figma.com/design/7HuDPJ6EB6g7Pt9nGAQCAx/Gravity-UI-Kit

Use it as the reference for components, tokens and visual details. When code and Figma disagree, Figma wins unless told otherwise.

A component is done when its Figma master, its implementation and its Storybook story agree.

Always keep Figma, code and Storybook in sync: a change to any of them (a component, variant, token or icon) lands in the other two in the same piece of work.

## Stack

- Svelte 5 (runes) on Deno, Tailwind CSS 4, Storybook 10.
- **bits-ui is the backbone.** Every interactive primitive it offers (Button, Checkbox, Select, Dialog, Popover, PinInput, ToggleGroup, Tabs, Collapsible, Separator, Label…) wraps the bits-ui part and only adds styling. Never re-implement its ARIA, focus or keyboard handling.
- `tv` and `cn` from `src/utils/classes.ts` for classes. Both are configured so tailwind-merge knows the custom tokens; never import `tailwind-variants` or `tailwind-merge` directly.
- `motion` for springs, `@use-gesture/vanilla` for drags, `runed` for small reactive helpers, `focus-trap` where no bits-ui part fits (BottomSheet), `libphonenumber-js` for phone data.
- Under Deno's `node_modules` layout Vite can't detect Svelte libraries, so any new one must join `svelteLibraries` in `vite.config.ts`. Every runtime import must be listed in `RUNTIME_DEPENDENCIES` (`src/vite.ts`); `src/vite.test.ts` enforces it.

## Layout

```
src/
  mod.ts                    public barrel: every component, attachment, type and utility
  phone-input.ts, vite.ts   extra entry points (see "exports" in deno.json)
  components/<name>/
    <name>.svelte           the component
    <name>.stories.svelte   Storybook story (required)
    <name>.svelte.test.ts   vitest + jsdom test, for behaviour beyond markup
    types.ts                public types, re-exported from mod.ts
    <topic>.ts              pure logic, tested by <topic>.test.ts (Deno)
  attachments/<name>/       {@attach} behaviours: gravity, expand, indicator, focus-trap, prevent-wheel
  motion/                   shared spring and pointer-velocity math
  utils/                    classes (tv, cn), initials, reactive helper classes
  styles/, fonts/           tokens, Tailwind theme, self-hosted fonts
```

- Public types live in `.ts` files: Deno can't read types out of `.svelte` files.
- Tests: `*.svelte.test.ts` run under vitest/jsdom, `*.test.ts` under `deno test`. Component tests import from `@gravity-community/svelte`, the way a consumer does. jsdom gaps are shimmed once in `vitest-setup-client.ts`, never per test.

## Component template

```svelte
<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const badge = tv({
  base: "inline-flex items-center rounded-[2px] border",
  variants: {
    intent: { neutral: "…", danger: "…" },
    size: { sm: "…", md: "…" },
  },
  defaultVariants: { intent: "neutral", size: "sm" },
});
</script>

<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";

type Props = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>;

let { intent, size, class: className, children, ...rest }: Props = $props();
</script>

<span class={cn(badge({ intent, size }), className)} {...rest}>
  {@render children?.()}
</span>
```

- Variant defaults live in `defaultVariants`. A variant also read outside `tv` is defaulted in the `$props()` destructure instead, and left out of `defaultVariants`; so are all other props.
- The root element merges the caller's class with `cn(…, className)` and receives `...rest`.
- `Pick<VariantProps<…>, …>` when the `tv` has internal variants that aren't props.
- Wrapping bits-ui: `type Props = Primitive.RootProps & { … }`, keep its bindable props bindable (`bind:ref`, `bind:value`, `bind:open`, `bind:checked`) and its callbacks (`onValueChange`, `onOpenChange`) unchanged. `ref = $bindable(null)` goes on the part that receives `...rest`, as in Button.
- Svelte's docgen can't see through bits-ui's nested `Omit`s; `.storybook/preview.ts` hides the leaked HTML attributes, and a page that still lists irrelevant ones sets an `ownProps` include list (see Collapsible's story).
- Svelte transitions on bits-ui content use `forceMount` and the `child` snippet; CSS transitions can key off `data-starting-style` / `data-ending-style`.
- bits-ui's scroll lock (modal Dialog, Popover) sets `pointer-events: none` on `body`; controls layered above non-portalled content need `pointer-events-auto`.
- Attachments take a getter so option changes update in place: `{@attach gravity(() => options)}`.

## Prop naming

- `intent` is the semantic colour (never `color` or `type`), `variant` the visual style, `size` is `sm | md | lg`.
- States are booleans: `disabled`, `invalid` (never `error`), `loading`, `checked`, `open`. `active` means the current location, `selected` means picked by the user.
- Slots are snippets: `children`, `icon`, `leading`, `actions`, …
- Own callbacks are lowercase `on<event>` (`onselect`, `onclose`); bits-ui's pass through under their own names.

## Visual rules

- Flat: no shadows. Tokens only, no raw colours in components.
- Fields (Input, Select, Textarea, PhoneInput, SearchInput and the like) take the `tinted` variant on white surfaces (`surface/1`, `surface/raised`; `bg-surface`, `bg-surface-raised` in code) and the `default` variant, a white fill with a border, on grey ones (`page-subtle`, `surface-subtle`, `surface-muted`…). Stories and Figma examples follow it too.
- Light and dark follow `prefers-color-scheme`; there is no manual theme switch.
- Hosts of the `gravity` attachment use `transition-interactive`, never a bare `transition`, since gravity owns `transform`.

## Storybook

- The sidebar mirrors the Figma pages: `Getting started`, `Changelog`, `Foundations/*`, then one page per component under its Figma category (`Actions`, `Inputs`, `Feedback`, `Data display`, `Navigation`, `Overlays`, `Layout`, `Typography`). Titles are `<Category>/<Component>`; the order lives in `.storybook/preview.ts`.
- One story file per component page; parts Figma keeps on another page join that file (Tab lives in the Tabs file). Docs-only pages are MDX in `src/docs/`.
- `autodocs` and `layout: "centered"` are global. A meta sets `parameters.layout` only to differ, and always a one-sentence `parameters.docs.description.component`.
- Stories, in this order and only those that apply: `Playground` (args + controls), `Variants`, `Sizes`, `States`, then named examples in sentence case. Every story but `Playground` disables controls.
- Variant, size and state grids use `Matrix` (`src/storybook/matrix.svelte`), the counterpart of a Figma variant grid. Axis values are `as const` arrays shared with `argTypes`. `src/components/badge/badge.stories.svelte` is the reference.

## Commands

devenv (`devenv.nix`, entered through direnv) provides Deno and Node; add tools there, never globally.

```bash
devenv up             # Storybook as a devenv process
deno task storybook   # workbench at http://localhost:6006
deno task check       # deno check + svelte-check
deno task test        # Deno logic tests, then vitest component tests
deno fmt && deno lint
```
