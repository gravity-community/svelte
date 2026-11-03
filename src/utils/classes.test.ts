import { assert, assertEquals } from "@std/assert";
import { cn, tv } from "./classes.ts";

const css = await Deno.readTextFile(
  new URL("../styles/variables.css", import.meta.url),
);
const start = css.indexOf("@theme {");
// Comments go first: the spacing note itself mentions `--spacing-none:`.
const theme = css
  .slice(start, css.indexOf("\n}\n", start))
  .replace(/\/\*[\s\S]*?\*\//g, "");

/** The keys of one @theme namespace, e.g. `label` for `--text-label:`. */
const keys = (namespace: string): string[] => {
  const pattern = new RegExp(`--${namespace}-([a-z0-9]+(?:-[a-z0-9]+)*):`, "g");
  const found = [...theme.matchAll(pattern)].map((match) => match[1]);
  assert(found.length > 0, `no --${namespace}-* keys in @theme`);
  return found;
};

Deno.test("every text role is a font size, not a colour", () => {
  for (const role of keys("text")) {
    assertEquals(cn("text-fg", `text-${role}`), `text-fg text-${role}`);
    assertEquals(cn("text-sm", `text-${role}`), `text-${role}`);
    assertEquals(
      tv({ base: "text-fg", variants: { r: { x: `text-${role}` } } })({
        r: "x",
      }),
      `text-fg text-${role}`,
    );
  }
});

Deno.test("every leading role is a line height", () => {
  for (const role of keys("leading")) {
    assertEquals(cn("leading-none", `leading-${role}`), `leading-${role}`);
  }
});

Deno.test("every spacing key resolves as spacing", () => {
  for (const key of keys("spacing")) {
    assertEquals(cn(`p-${key}`, "p-0"), "p-0");
    assertEquals(cn("gap-0", `gap-${key}`), `gap-${key}`);
    assertEquals(
      tv({ base: `gap-${key}`, variants: { g: { x: "gap-0" } } })({ g: "x" }),
      "gap-0",
    );
  }
});

Deno.test("every animate token is an animation", () => {
  for (const key of keys("animate")) {
    assertEquals(cn(`animate-${key}`, "animate-none"), "animate-none");
  }
});

Deno.test("an explicit leading survives a later font size, as in Tailwind 4", () => {
  assertEquals(cn("leading-none", "text-sm"), "leading-none text-sm");
  assertEquals(cn("leading-5", "text-label"), "leading-5 text-label");
  assertEquals(
    tv({ base: "leading-none", variants: { s: { x: "text-sm" } } })({ s: "x" }),
    "leading-none text-sm",
  );
  // A size's own line height still replaces it.
  assertEquals(cn("leading-4", "text-sm/6"), "text-sm/6");
});

Deno.test("transition-interactive replaces a bare transition", () => {
  assertEquals(
    cn("transition", "transition-interactive"),
    "transition-interactive",
  );
});
