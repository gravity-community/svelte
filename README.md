# @gravity-community/svelte

A Svelte 5 design system built on [bits-ui](https://bits-ui.com) and Tailwind
CSS 4. Designs live in the
[Gravity Figma file](https://www.figma.com/design/7HuDPJ6EB6g7Pt9nGAQCAx/Gravity-UI-Kit).

## Installation

```bash
deno add jsr:@gravity-community/svelte   # Deno
npm install @gravity-community/svelte    # npm
```

Add the Vite plugin ahead of `deno()`:

```ts
import { gravity } from "@gravity-community/svelte/vite";

export default defineConfig({
  plugins: [gravity(), deno(), sveltekit(), tailwindcss()],
});
```

Import the stylesheet once, as the app's only Tailwind entry:

```css
@import "@gravity-community/svelte/styles/variables.css";
```

## Usage

```svelte
<script lang="ts">
import { Button, Container } from "@gravity-community/svelte";
</script>

<Container size="sm">
  <Button type="submit">Save</Button>
</Container>
```

Components, entry points and the changelog are documented in Storybook.

## Development

Requires [devenv](https://devenv.sh) and [direnv](https://direnv.net).

```bash
direnv allow          # enter the dev shell
deno task storybook   # Storybook at http://localhost:6006
deno task check       # type-check
deno task test        # run tests
deno fmt && deno lint
```

Conventions are in [CLAUDE.md](CLAUDE.md).

## License

[MIT](LICENSE)
