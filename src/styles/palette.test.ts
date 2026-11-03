import { assert, assertEquals } from "@std/assert";

type Scheme = "light" | "dark";

const css =
  (await Deno.readTextFile(new URL("./variables.css", import.meta.url)))
    .replace(/\/\*[\s\S]*?\*\//g, "");
const light = declarations(blockAfter(css.search(/^:root\s*\{/m)));
const dark = declarations(
  blockAfter(
    css.indexOf(":root", css.indexOf("@media (prefers-color-scheme: dark)")),
  ),
);
const theme = declarations(blockAfter(css.search(/^@theme\s*\{/m)));

const RAMPS = ["gray", "blue", "sky", "green", "amber", "red"];
const STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
];
const PRIMITIVE = new RegExp(
  `^--gravity-(white|black|(${RAMPS.join("|")})-\\d+)$`,
);
const HOVER_INTENTS = [
  "primary",
  "success",
  "warning",
  "danger",
  "neutral",
  "accent",
];
/** What controls and marks sit on: the page, panels and floating layers. */
const PAGES = [
  "surface-1",
  "bg-page-subtle",
  "bg-surface-subtle",
  "surface-raised",
];
const SURFACES = [...PAGES, "bg-surface-muted", "field-tinted-bg"];
/** The ink each Button intent's soft, outline and ghost labels use. */
const LABEL: Record<string, string> = {
  primary: "text-primary",
  success: "success-strong",
  warning: "warning-strong",
  danger: "danger-strong",
  neutral: "text-primary",
  accent: "text-primary",
};

Deno.test("primitives are scheme-independent ramps that darken step by step", () => {
  for (const ramp of RAMPS) {
    const steps = STEPS.map((step) => `--gravity-${ramp}-${step}`);
    for (const name of steps) {
      assert(light.has(name), `${name} is missing`);
      assert(!dark.has(name), `${name} changes in dark`);
    }
    const lum = steps.map((name) => luminance(rgb(light.get(name)!)));
    for (let i = 1; i < lum.length; i++) {
      assert(
        lum[i] < lum[i - 1],
        `${steps[i]} is not darker than ${steps[i - 1]}`,
      );
    }
  }
});

Deno.test("every semantic colour points at a primitive", () => {
  for (const [scheme, block] of [["light", light], ["dark", dark]] as const) {
    for (const [name, value] of block) {
      if (PRIMITIVE.test(name) || name.startsWith("--gravity-avatar-")) {
        continue;
      }
      if (value.startsWith("#")) {
        assert(rgb(value)[3] < 1, `${name} (${scheme}) is raw hex`);
        continue;
      }
      assert(
        PRIMITIVE.test(chain(scheme, name).at(-1)!),
        `${name} (${scheme}) doesn't reach a primitive`,
      );
    }
  }
});

Deno.test("Button labels clear 4.5:1 in every state", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (const intent of HOVER_INTENTS) {
      const on = c(`text-on-${intent}`), hover = c(`${intent}-hover`);
      expectRatio(
        on,
        c(`${intent}-solid`),
        4.5,
        `${scheme} on-${intent} on solid`,
      );
      expectRatio(on, hover, 4.5, `${scheme} on-${intent} on hover`);
      // Pressed solid adds brightness(90%) to the hover fill.
      expectRatio(
        dim(on, 0.9),
        dim(hover, 0.9),
        4.5,
        `${scheme} on-${intent} pressed`,
      );
      const label = c(LABEL[intent]), muted = c(`${intent}-muted`);
      expectRatio(
        label,
        c(`${intent}-subtle`),
        4.5,
        `${scheme} ${intent} label on subtle`,
      );
      expectRatio(label, muted, 4.5, `${scheme} ${intent} label on muted`);
      // Pressed soft adds brightness(95%) to the muted fill.
      expectRatio(
        dim(label, 0.95),
        dim(muted, 0.95),
        4.5,
        `${scheme} ${intent} label pressed`,
      );
      for (const surface of SURFACES) {
        expectRatio(
          label,
          c(surface),
          4.5,
          `${scheme} ${intent} label on ${surface}`,
        );
      }
    }
  }
});

// Badge, Status, Callout and NavItem draw the strong inks on their own tints.
Deno.test("strong inks clear 4.5:1 on their tints and the page", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (const intent of [...HOVER_INTENTS, "info"]) {
      const strong = c(`${intent}-strong`);
      for (const bg of [`${intent}-subtle`, `${intent}-muted`, ...SURFACES]) {
        expectRatio(strong, c(bg), 4.5, `${scheme} ${intent}-strong on ${bg}`);
      }
    }
  }
});

// CodeBlock's panel is surface-inverse, an active NavItem primary-subtle and an
// invalid FileUpload danger-subtle.
Deno.test("the focus ring clears 3:1 on everything it is drawn over", () => {
  for (const scheme of ["light", "dark"] as const) {
    const ring = rgb(resolve(scheme, "--color-border-focus"));
    for (
      const surface of [
        ...SURFACES,
        "surface-inverse",
        "primary-subtle",
        "danger-subtle",
      ]
    ) {
      expectRatio(
        ring,
        rgb(resolve(scheme, `--gravity-${surface}`)),
        3,
        `${scheme} ring on ${surface}`,
      );
    }
  }
});

// Dots, markers and outline borders draw in -solid, and a control's only
// edge is border-interactive. surface-muted is a fill, never a page, so it is
// left out.
Deno.test("marks and control edges clear 3:1 on the page and panels", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    const marks = [
      ...[...HOVER_INTENTS, "info"].map((intent) => `${intent}-solid`),
      "border-interactive",
    ];
    for (const mark of marks) {
      for (const page of PAGES) {
        expectRatio(c(mark), c(page), 3, `${scheme} ${mark} on ${page}`);
      }
    }
  }
});

Deno.test("raised layers and the selected chip lift off what they sit on", () => {
  for (const scheme of ["light", "dark"] as const) {
    const lum = (token: string) =>
      luminance(rgb(resolve(scheme, `--gravity-${token}`)));
    assert(
      lum("bg-surface-selected") > lum("bg-surface-subtle"),
      `${scheme} selected chip is not lighter than its track`,
    );
    assert(
      lum("surface-raised") >= lum("surface-1"),
      `${scheme} raised layer is darker than the page`,
    );
    expectRatio(
      rgb(resolve(scheme, "--gravity-text-primary")),
      rgb(resolve(scheme, "--gravity-bg-surface-selected")),
      4.5,
      `${scheme} text on the selected chip`,
    );
  }
  assert(
    luminance(rgb(resolve("dark", "--gravity-surface-raised"))) >
      luminance(rgb(resolve("dark", "--gravity-surface-1"))),
    "dark raised layer doesn't lift off the black page",
  );
});

// A tinted field has no border to recolour, so its fill alone shows focus. Only
// its value, placeholder and icons sit on that fill, plus the outline of a
// focused button inside it (clear, reveal).
Deno.test("a focused tinted field steps off its resting fill and stays legible", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (
      const [rest, focus] of [
        ["field-tinted-bg", "field-tinted-bg-focus"],
        ["danger-subtle", "danger-muted"],
      ]
    ) {
      expectRatio(c(focus), c(rest), 1.1, `${scheme} ${focus} on ${rest}`);
      const ring = c("field-tinted-focus-ring");
      expectRatio(ring, c(focus), 3, `${scheme} inner ring on ${focus}`);
    }
    for (const ink of ["text-primary", "text-secondary"]) {
      const fill = c("field-tinted-bg-focus");
      expectRatio(c(ink), fill, 4.5, `${scheme} ${ink} on the focused fill`);
    }
  }
});

// Ink is keyed fg, *-fg or on-*, and nothing else is: a bare --color-subtle
// let border-subtle paint tertiary ink.
Deno.test("text colour utilities are named for text", () => {
  for (const [key, value] of theme) {
    const token = alias(value);
    if (!key.startsWith("--color-") || !token?.startsWith("--gravity-")) {
      continue;
    }
    const name = key.slice("--color-".length);
    const ink = /^--gravity-(text-[\w-]+|[\w-]+-text)$/.test(token);
    const named = name === "fg" || name.endsWith("-fg") ||
      name.startsWith("on-");
    assertEquals(named, ink, `--color-${name} -> ${token}`);
  }
});

function blockAfter(start: number): string {
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error("unbalanced block");
}

function declarations(body: string): Map<string, string> {
  return new Map(
    [...body.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)].map((
      m,
    ) => [m[1], m[2].trim()]),
  );
}

function raw(scheme: Scheme, name: string): string {
  const value = (scheme === "dark" ? dark.get(name) : undefined) ??
    light.get(name) ??
    theme.get(name);
  assert(value !== undefined, `${name} is not declared`);
  return value;
}

/** The var() chain behind a name, for example [--color-fg, --gravity-text-primary, --gravity-gray-900]. */
function chain(scheme: Scheme, name: string): string[] {
  const out = [name];
  let ref = alias(raw(scheme, name));
  while (ref) {
    out.push(ref);
    ref = alias(raw(scheme, ref));
  }
  return out;
}

function alias(value: string): string | undefined {
  return /^var\((--[\w-]+)\)$/.exec(value)?.[1];
}

function resolve(scheme: Scheme, name: string): string {
  return raw(scheme, chain(scheme, name).at(-1)!);
}

/** #rgb[a] or #rrggbb[aa] as sRGB channels and alpha, 0-1. */
function rgb(hex: string): [number, number, number, number] {
  const h = hex.slice(1);
  const full = h.length <= 4 ? [...h].map((c) => c + c).join("") : h;
  const [r, g, b, a = 255] = (full.match(/../g) ?? []).map((x) =>
    parseInt(x, 16)
  );
  return [r / 255, g / 255, b / 255, a / 255];
}

function luminance([r, g, b]: number[]): number {
  const lin = (c: number) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** CSS brightness(): a linear slope on the encoded channels. */
function dim(
  [r, g, b, a]: number[],
  k: number,
): [number, number, number, number] {
  return [Math.min(1, r * k), Math.min(1, g * k), Math.min(1, b * k), a];
}

function expectRatio(fg: number[], bg: number[], min: number, what: string) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  const ratio = (hi + 0.05) / (lo + 0.05);
  assert(ratio >= min, `${what}: ${ratio.toFixed(2)}:1, needs ${min}:1`);
}
