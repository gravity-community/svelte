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
  utils/                    classes (tv, cn), energy (levels, energy scope), initials, reactive helper classes
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

- `intent` is the semantic colour (never `color` or `type`), `energy` how much attention (`"3"` solid to `"0"` ghost, or a shift such as `"-1"`; see Energy), `variant` any other visual style, `shape` the corner rounding (`rounded | pill`), `size` is `sm | md | lg` (IconCircle adds `xl` for Status's largest ring).
- States are booleans: `disabled`, `invalid` (never `error`), `loading`, `checked`, `open`. `active` means the current location, `selected` means picked by the user.
- Slots are snippets: `children`, `icon`, `leading`, `actions`, …
- Own callbacks are lowercase `on<event>` (`onselect`, `onclose`); bits-ui's pass through under their own names.

## Energy

- Two props ask for attention: `intent` says what kind (the colour), `energy` says how much. Never express how much attention through `intent`. An element with no colour of its own is neutral; primary marks only state (checked, selected, active, current, done), never decoration.
- `energy` has four levels, numbered from `3`, solid (the most excited), through `2`, soft, and `1`, faint, down to `0`, ghost. They run highest first, in this order everywhere (`as const` arrays, `tv` variants, Storybook `argTypes` and `Matrix` axes, Figma property options and canvas). The names are what we call the levels; the prop and Figma's Energy property take the numbers.
- `energy` takes an absolute level (`"0"` to `"3"`, typed to the component's range) or a shift from the component's potential: `"-1"` (the common case) is one level below it, `"+1"` (rare) lifts an element back up inside a well, never above its potential. Leave it out and the element takes its default: its potential (ListItem: `0`), or inside a composed component the level of the slot it sits in (see Parts). Components don't know their well yet, so a `+n` on the prop stops at the potential; until the planned Card passes depth down, lift with `resolveEnergy("+1", range, depth)`. Write ghost as `"0"`, and a level between potential and ground as a shift. A component resolves the value with `resolveEnergy(energy, energyRange)` before its `tv`, so `energy` stays out of `defaultVariants`.
- Each component defines its range (`energyRange`, potential first): its potential (the highest level it takes, where it sits on the blank page, and its default) down to its ground (the lowest level it takes). The blank page has the highest potential. Ranges:
  - Button and IconCircle: `3` → `0`. IconCircle takes `primary` too.
  - Badge, Status, Callout, Alert, DataList, SegmentedControl: `2` → `0`. Status's ghost drops the box's padding, the one exception to ghost keeping its padding.
  - ListItem: `2` → `0`, default `0` (a plain row), the one component whose default isn't its potential.
  - Input, PhoneInput, SearchInput, Select, Combobox, Textarea: `2` → `1` (`0` not offered yet). InputOtp: `2` (tiles) → `1` (framed tiles).
  - OptionCard and InfoCard: `2` → `1`, with `intent` (neutral by default, or primary, info, success, warning, danger).
  - Choice: `2` → `1`, neutral (no `intent`).
  - Checkbox: `2` → `1`, a field box (see Fields).
  - RadioGroup: `2` → `1`, a field (see Fields), Checkbox's twin on a disc.
  - NavItem has no prop: the current page is soft primary, every other item ghost neutral. Quiet built-in controls (close, back, copy, clear, reveal) are ghost neutral (`energy="0"`).
  - A text action in or just under a line of text, with no padding (a hint's "Enter manually", "Try again", a flow's "Cancel" or "Use a backup code"), is a `Link`, never a ghost Button: a Button always keeps its box and padding.
- Core recipes, for every component with an `intent` (Button, IconCircle, Badge, and the boxes of Status, Callout and Alert):
  - solid (`3`): filled with the intent's solid colour; text and icons are cut out of it, in the colour of the surface underneath: white in light mode, the dark surface in dark mode. The one exception is primary in dark mode: it keeps Gravity's blue-600, too dark for a black cut-out, so its text stays white. Solid only ever sits on the page or an overlay (any filled well decays it, unless a `+n` shift lifts it back), and every solid fill clears 4.5:1 against its text.
  - soft (`2`): filled with the intent's soft colour (`-subtle`); text and icons in the intent's colour.
  - faint (`1`): the grey plate (`bg-plate`, `neutral-strong` at 5% / 12%), no edge; text and icons in the intent's colour, so the hue lives only in the ink. A faint box that holds parts (Status, Callout, Alert, an intent card) is a filled well: it carries `filled-well`, so its parts' plates glaze to 6%.
  - ghost (`0`): no fill and no border, just text and icons in the intent's colour, keeping the component's size and padding.
  - Text and icons in "the intent's colour" are its `-strong` ink, `neutral-strong` for neutral.
  - On hover, solid and soft deepen their fill (accent's hover steps toward mid grey, since it can't get deeper); faint and ghost take the soft fill, so the colour arrives, and press takes soft's hover. Faint and ghost keep the hover fill while `aria-current`, `aria-expanded="true"`, `aria-pressed="true"` or `data-state="open"` is set. A held toggle also changes its glyph, label or weight, not only its fill.
  - Disabled: solid, soft and faint show the grey disabled box (`bg-surface-muted`); ghost shows only the disabled text colour.
  - Every level keeps the component's size: where a component has a border at some level, the others draw it transparent, which forced colours still show. One with no edge at any level (Button, IconCircle, and the boxes of Status, Callout and Alert) draws it only in forced colours (`forced-colors:border`).
- Fields (no intent): soft (`2`) is the grey `well` fill (`bg-well`, `bg-well-active` when focused or open) with a transparent border, so its states change only the fill; faint (`1`) is a transparent box with the soft frame `border-field`, one step firmer (`border-field-hover`) on hover, and the 2px focus ring (`border-focus` plus an inset ring) when focused. Invalid is the danger fill at `2` and the `danger-solid` edge at `1`; disabled is the grey box at both. Placeholders are `muted-fg` at both levels. A Checkbox takes the fields' soft fill and faint frame, but keeps the global focus outline and has no invalid look yet. Checked, it lifts one level, as Choice's radio does: a `primary-solid` box with an `on-primary` check at `2`, `primary-deep` inside a `border-focus` frame with a `primary-strong` check at `1`. Disabled, it is the plate at both levels: `bg-surface-muted` would match the soft box in dark mode and vanish in a well. RadioGroup's radio is the same control on a disc, with a 6px dot; invalid is the danger fill at `2` and the `danger-solid` ring at `1`, and the chosen radio while invalid lifts in danger (a `danger-solid` disc at `2`, `danger-deep` in a `danger-solid` ring at `1`).
- Neutral surfaces (neutral OptionCard and InfoCard, Choice's cards, ListItem's row, DataList's panel, SegmentedControl's track): soft is the grey `well` fill (the track: `neutral-subtle`); faint is a 1px `neutral-subtle` edge with no fill. Intent cards: soft is the intent's `-subtle` fill, hovering to `-subtle-hover`; faint is the plate. Hover on a faint surface brings in the soft fill. Selected is a state mark at every level: a 2px edge in the intent's solid colour (`border-focus` for primary) over the soft fill; a neutral card selects in primary. Choice selects like a field at soft: its states change only the fill (checked `primary-subtle`, invalid and refused `danger-subtle`) and its radio carries the choice; at faint, checked is the selected mark, invalid the `danger-solid` edge, and refused the 2px `danger-solid` edge over `danger-subtle`.
- Text follows the level a composed component shows (Status, Callout, ListItem, DataList, OptionCard, InfoCard, Choice): titles (DataList's values too) `fg` at `2` and `quiet-fg` at `1` and `0`; eyebrows `<intent>-strong` at `2` and `1` and `<intent>-quiet` at `0` (`muted-fg` for neutral); body, descriptions and meta `muted-fg` at every level. Exempt: Button and Badge labels, Alert's message, field values and placeholders, SegmentedControl's labels. Plain text in a card keeps `fg` and `muted-fg`.
- Wells and depth: every region that holds content is a well: the page, cards, Callouts, overlays, and a component's own shape (IconCircle's circle around its glyph, a Button's box around its label).
  - The page (`surface/1`, `bg-surface`) has depth 0. So does an overlay (sheet, popover, dialog; `surface/raised`, `bg-surface-raised`): it is a well of its own on the page, not inside the card that opened it.
  - A filled well is one level deeper than its parent: grey (a card, `page-subtle` pages and panels, `surface-subtle`, `surface-muted`), coloured (an intent's `-subtle` fill, as in a soft Callout and Alert) or inverse (`surface-inverse`, as in CodeBlock, where inks and edges also switch to the inverse colours). A well without a fill of its own (a bordered card, a layout wrapper) keeps its parent's depth. Depth never decreases inward.
  - Decay: in a well of depth N, every element sits N levels below the level it was given (default, absolute or shifted) and stops at its ground. In a card on the page (depth 1), a Button given `3` shows `2`, one given `1` shows `0`, and an Input shows `1`. A component's own parts (a chip, a dot, a ring) don't decay on their own: they follow their component (see Parts). Shape never decays.
  - Wells glaze their contents: inside a filled well, a soft fill becomes a glaze of its own ink, 10% at rest and 15% on hover and press, instead of the opaque `-subtle` fill, and so does a nested well's own tint. The same glaze replaces the hover and held fills of faint and ghost. The grey `well` fill of soft fields and cards glazes more gently, `neutral-strong` at 8% and 10%, so secondary text keeps 4.5:1; the plate glazes to 6%, a field's frame to 22% (30% on hover). An opaque tint vanishes on a grey or coloured well (1.00–1.14:1, nothing at all on a well of the same intent); a glaze always sits a step off it. A filled well applies all this with the `filled-well` utility, which also turns `border-interactive` into `border-interactive-strong` so control edges keep 3:1, and points focus rings at `well-focus-ring`.
  - On an inverse well, a ghost uses the inverse recipe: `on-inverse` ink, and a glaze of it on hover.
  - Callers apply decay by hand today, with `resolveEnergy(energy, range, depth)`. A planned Card, and the wells rebuilt on it, will apply it automatically.
- Parts: a composed component (Status, Callout, Alert, ListItem, DataList, OptionCard, InfoCard) is a well whose parts match the level it shows; its definition gives a part a predefined level only where the part would steal attention from the whole, and the well around the component lowers all of it together.
  - Predefined levels: Status's IconCircle and main action match, its second action is ghost neutral; Callout's and Alert's icon is a bare glyph; Callout's actions match; Alert's close is ghost neutral; ListItem's leading IconCircle and Badge match and its trailing actions sit one level lower; DataList's Copy is ghost neutral; OptionCard's and InfoCard's chip match, OptionCard's one level higher while selected; Choice's radio matches, one level higher while checked (its cut-out dot is about a third of the disc), and an empty radio stays `neutral-deep` at faint, where the plate would vanish.
  - In code, a composed component sets an energy scope (`setEnergyScope`, or `<EnergyScope>` around a slot whose level differs); Button, IconCircle and Badge given no `energy` take the scope's level; a shift still counts from the potential, and an absolute level ignores the scope. Fixed parts are written absolute (`energy="0" intent="neutral"`), Status's second action by its caller. Overlays reset the scope for their content. Inside a composed component, leave a part's `energy` unset so it follows its container; never decay it by hand.
  - Soft on soft: a soft part on a fill of its own intent (Status's IconCircle on its box, a neutral IconCircle, Badge or chip on a grey row or card, a selected card's chip) uses the deep glaze, `bg-<intent>-deep` (20% of `-solid`; `border-focus` for primary, `neutral-solid` for neutral), and a soft Button `bg-<intent>-deep/75`, hovering to `-deep`. The scope's `fill` tells a part which intent it sits on. Parts of another intent keep the well's 10% glaze.
  - The glyph rule: a part never gets louder at a lower level. At `1` and `0`, an IconCircle's glyph, a chip's glyph and Callout's and Alert's icon take `<intent>-glyph-faint` and `<intent>-glyph-ghost`, quieter steps of the intent's ramp, one value per intent and level everywhere, that keep 3:1 on every page, plate and well and, wherever 3:1 allows, stay at or under the level above. Callout's and Alert's icon is a bare glyph whose ink follows the component's level. A pulsing Status keeps `-strong`. Labels keep `-strong`, so they still rise as the fill drops.
  - In Figma, two variable collections encode this. `Depth` (modes `Depth 0` to `Depth 3`) counts the filled wells around a component: set it on a designer's well frame (a card on the page is `Depth 1`, a Callout inside it `Depth 2`); modes are absolute because Figma can't count wells, and they inherit down the layer tree. Component fills, edges and inks bind to its `energy/…` variables, indexed by the level given, which resolve in each mode to the decayed look. `Well` (modes `Open`, `Filled`, `Same intent`) says what lies directly under a part at `Depth 0`; only masters set it, on the slots of their filled boxes (`Same intent` for a part of the box's intent, `Filled` for the rest). Composed masters never set Depth on their slots, so instances need no mode overrides, and each part's Energy property is set per variant to its matched or predefined level. Every component keeps a 1px inside stroke whose colour turns transparent where a level has no edge. The `glaze/…`, `bg/plate`, `<intent>/deep`, `<intent>/quiet` and `<intent>/subtle-hover` variables hold raw colours, so recompute them when the `-strong`, `-solid`, `-subtle` / `-muted` or `neutral/strong` they come from changes.
- Full rounding is the separate `shape` prop (`rounded | pill`), never an energy level. Button and the one-line fields (Input, PhoneInput, SearchInput, Select, Combobox) offer it at every level; it's declared after `size` in the `tv` so tailwind-merge drops the size's radius. In Figma it's the shared Shape variable collection (modes `rounded | pill`), set on the instance, not on a parent frame, since code has no counterpart for that.
- Migration in progress: level `1` is now faint (the plate, the soft frame for fields, a `neutral-subtle` edge for neutral surfaces), replacing the bordered look; code, Storybook, the Gravity Figma masters and the Depth and Well variables move together, then certifix and eurcor. The Certifix Figma file picks the changes up with the next Gravity publish and still uses the `pill (deprecated)` field variants until its migration lands; those variants are deleted afterwards. Don't add new uses of the old names or of the bordered level 1.

## Visual rules

- Flat: no shadows. Tokens only, no raw colours in components.
- Components take the `energy` level decay gives them in their well (see Energy); stories and Figma examples follow the same rule.
- Light and dark follow `prefers-color-scheme`; there is no manual theme switch.
- Hosts of the `gravity` attachment use `transition-interactive`, never a bare `transition`, since gravity owns `transform`.

## Storybook

- The sidebar mirrors the Figma pages: `Getting started`, `Changelog`, `Foundations/*`, then one page per component under its Figma category (`Actions`, `Inputs`, `Feedback`, `Data display`, `Navigation`, `Overlays`, `Layout`, `Typography`). Titles are `<Category>/<Component>`; the order lives in `.storybook/preview.ts`.
- One story file per component page; parts Figma keeps on another page join that file (Tab lives in the Tabs file). Docs-only pages are MDX in `src/docs/`.
- `autodocs` and `layout: "centered"` are global. A meta sets `parameters.layout` only to differ, and always a one-sentence `parameters.docs.description.component`.
- Stories, in this order and only those that apply: `Playground` (args + controls), `Variants`, `Sizes`, `States`, then named examples in sentence case. Every story but `Playground` disables controls.
- Variant, size and state grids use `Matrix` (`src/storybook/matrix.svelte`), the counterpart of a Figma variant grid. Axis values are `as const` arrays shared with `argTypes`. `src/components/badge/badge.stories.svelte` is the reference.
- A component with `energy` shows its levels twice: on the page, and inside a filled well, where decay and the glaze apply. A composed component adds a `Parts` story: each level with its real parts, predefined levels included. A component with `shape` adds a `Pill` story.
- MDX pages draw their examples with `var(--gravity-…)` only, never raw colours, and write tables as JSX `<table>`: this Storybook has no GFM tables in MDX.

## Commands

devenv (`devenv.nix`, entered through direnv) provides Deno and Node; add tools there, never globally.

```bash
devenv up             # Storybook as a devenv process
deno task storybook   # workbench at http://localhost:6006
deno task check       # deno check + svelte-check
deno task test        # Deno logic tests, then vitest component tests
deno fmt && deno lint
```
