import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

/** npm packages the shipped modules import at run time; `vite.test.ts` checks it against the source. */
export const RUNTIME_DEPENDENCIES: readonly string[] = [
  "@maskito/core",
  "@use-gesture/vanilla",
  "bits-ui",
  "clsx",
  "country-flag-icons",
  "focus-trap",
  "libphonenumber-js",
  "motion",
  "runed",
  "tailwind-merge",
  "tailwind-variants",
];

// bits-ui's helper library ships runes in .svelte.js files, so it must be compiled too.
const SVELTE_ONLY_DEPENDENCIES = ["svelte-toolbelt"];

const checkout = fileURLToPath(new URL("..", import.meta.url));
const variablesCss = fileURLToPath(
  new URL("./styles/variables.css", import.meta.url),
);

/** Lets a Vite app on Deno compile gravity from its source checkout. */
export function gravity(): Plugin {
  return {
    name: "gravity",
    config: () => ({
      resolve: {
        // Tailwind resolves CSS @imports node-style and can't follow a Deno link.
        alias: [{
          find: /^@gravity-community\/svelte\/styles\/variables\.css$/,
          replacement: variablesCss,
        }],
        // From the checkout, bare imports would miss the app's node_modules,
        // where Deno installs them; Svelte and Tailwind must be single copies.
        dedupe: [...RUNTIME_DEPENDENCIES, "svelte", "tailwindcss"],
      },
      // Deno's SSR loader only resolves the app member's own bare specifiers.
      ssr: {
        noExternal: [...RUNTIME_DEPENDENCIES, ...SVELTE_ONLY_DEPENDENCIES],
      },
    }),
    // The checkout is outside the app's workspace root. Added once resolved:
    // setting server.fs.allow in `config` would replace Vite's default.
    configResolved(config) {
      config.server.fs.allow.push(checkout);
    },
  };
}
