import type { StorybookConfig } from "@storybook/svelte-vite";
import tailwindcss from "@tailwindcss/vite";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const config: StorybookConfig = {
  stories: ["../src/docs/**/*.mdx", "../src/**/*.stories.svelte"],
  addons: ["@storybook/addon-svelte-csf", "@storybook/addon-docs"],
  framework: "@storybook/svelte-vite",
  viteFinal: (config) => {
    // No svelte() here: builder-vite already merged ../vite.config.ts, and a
    // second instance compiles every component twice and blanks the preview.
    config.plugins = [...(config.plugins || []), tailwindcss()];

    const root = process.cwd();

    // Vite keys its dep cache on lockfiles it knows, and deno.lock isn't one, so
    // a dependency bump would pair a new Svelte compiler with a stale prebundled
    // runtime. Key the cache on deno.lock instead.
    const lockHash = crypto
      .createHash("sha256")
      .update(fs.readFileSync(path.join(root, "deno.lock")))
      .digest("hex")
      .slice(0, 12);
    const cacheRoot = config.cacheDir ?? "node_modules/.cache/sb-vite";
    config.cacheDir = path.join(cacheRoot, lockHash);

    // Prune superseded caches (~16 MB each).
    const existing = fs.existsSync(cacheRoot)
      ? fs.readdirSync(cacheRoot, { withFileTypes: true })
      : [];
    for (const entry of existing) {
      if (
        entry.isDirectory() && /^[0-9a-f]{12}$/.test(entry.name) &&
        entry.name !== lockHash
      ) {
        fs.rmSync(path.join(cacheRoot, entry.name), {
          recursive: true,
          force: true,
        });
      }
    }

    config.server = {
      ...config.server,
      fs: {
        ...config.server?.fs,
        allow: [...(config.server?.fs?.allow || []), root],
      },
    };

    return config;
  },
};

export default config;
