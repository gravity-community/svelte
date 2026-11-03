import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import path from "node:path";

// Deno's node_modules layout hides these from Vite's Svelte-library detection.
const svelteLibraries = ["bits-ui", "runed", "svelte-toolbelt"];

export default defineConfig({
  // The only svelte() instance: Storybook merges this config, and a second
  // plugin would compile every component twice.
  plugins: [svelte({ prebundleSvelteLibraries: true }), svelteTesting()],
  optimizeDeps: { exclude: svelteLibraries },
  ssr: { noExternal: svelteLibraries },
  resolve: {
    // Tests import the public barrel, as a consumer would.
    alias: [
      {
        find: /^@gravity-community\/svelte$/,
        replacement: path.resolve("src/mod.ts"),
      },
      {
        find: /^@gravity-community\/svelte\/phone-input$/,
        replacement: path.resolve("src/phone-input.ts"),
      },
      {
        find: /^@gravity-community\/svelte\/phone$/,
        replacement: path.resolve("src/components/phone-input/countries.ts"),
      },
    ],
  },
  test: {
    environment: "jsdom",
    clearMocks: true,
    include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
    setupFiles: ["./vitest-setup-client.ts"],
  },
});
