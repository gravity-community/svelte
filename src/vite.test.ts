import { assertEquals } from "@std/assert";
import { walk } from "@std/fs";
import { RUNTIME_DEPENDENCIES } from "./vite.ts";

const SPECIFIER = /(?:from|import)\s+"([^"]+)"/g;

/** `@scope/name/sub` → `@scope/name`, `name/sub` → `name`. */
const packageOf = (specifier: string) =>
  specifier.split("/").slice(0, specifier.startsWith("@") ? 2 : 1).join("/");

Deno.test("RUNTIME_DEPENDENCIES matches what the shipped modules import", async () => {
  const found = new Set<string>();
  for await (
    const entry of walk(new URL(".", import.meta.url), {
      exts: [".ts", ".svelte"],
      skip: [
        /\.test\.ts$/,
        /\.stories\.svelte$/,
        /-harness\.svelte$/,
        /\/vite\.ts$/,
      ],
    })
  ) {
    for (
      const [, specifier] of (await Deno.readTextFile(entry.path)).matchAll(
        SPECIFIER,
      )
    ) {
      if (
        /^(\.|node:|svelte($|\/)|@gravity-community\/svelte($|\/))/.test(
          specifier,
        )
      ) continue;
      found.add(packageOf(specifier));
    }
  }
  assertEquals([...found].sort(), [...RUNTIME_DEPENDENCIES].sort());
});
