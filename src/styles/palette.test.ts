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
/** Colours derived from others, resolved where they're used. */
const derived = declarations(blockAfter(css.search(/^@theme inline\s*\{/m)));
const filledWell = css.search(/^@utility filled-well\s*\{/m);
/** What filled-well sets on the well itself, and on everything inside it. */
const wellSelf = declarations(blockAfter(filledWell).split(":where(&)")[0]);
const wellInside = declarations(
  blockAfter(css.indexOf(":where(&) *", filledWell)),
);

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
/** Gray's extra steps: the soft field (75, 125) and the level 1 field frame (150, 650). */
const GRAY_STEPS = ["75", "125", "150", "650"];
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
const INTENTS = [...HOVER_INTENTS, "info"];
/** What controls and marks sit on: the page, panels and floating layers. */
const PAGES = [
  "surface-1",
  "bg-page-subtle",
  "bg-surface-subtle",
  "surface-raised",
];
const SURFACES = [...PAGES, "bg-surface-muted", "bg-well"];
/** The tints that fill a well: Callout, Alert and Status. */
const WELL_TINTS = ["neutral", "info", "success", "warning", "danger"];
/** The filled wells: grey cards, panels and fills, and those tints. */
const WELLS = [
  "bg-page-subtle",
  "bg-surface-subtle",
  "bg-surface-muted",
  "bg-well",
  ...WELL_TINTS.map((intent) => `${intent}-subtle`),
];
/** Tints that hold body text: the wells' and a selected OptionCard's. Accent's only ever holds its own label. */
const TINTS = ["primary", ...WELL_TINTS];
/** An ink's glaze, in percent: filled-well's soft fills and the in-field controls' bg-current/10 and /15. */
const GLAZE = { rest: 10, press: 15 };
/** filled-well's glaze of the grey well fill, in percent: lighter, so secondary text keeps 4.5:1. */
const WELL_GLAZE = { rest: 8, press: 10 };
/** filled-well's neutral-strong glazes, in percent, for the faint plate and the level 1 field frame. */
const PLATE_GLAZE = 6;
const FIELD_GLAZE = { rest: 22, hover: 30 };
/** The deep glaze of a soft part on a soft fill of its own intent, in percent; a soft Button rests at 75% of it. */
const DEEP = 20;
/** Intents with boxes or cards: deep, glyph and (but neutral) subtle-hover and quiet. */
const PART_INTENTS = ["primary", ...WELL_TINTS];
const COLOR_INTENTS = PART_INTENTS.filter((intent) => intent !== "neutral");
/** Status eyebrows: neutral's steps to text-secondary at level 0 instead. */
const EYEBROW_INTENTS = WELL_TINTS.filter((intent) => intent !== "neutral");

Deno.test("primitives are scheme-independent ramps that darken step by step", () => {
  for (const ramp of RAMPS) {
    const steps = [...STEPS, ...(ramp === "gray" ? GRAY_STEPS : [])]
      .sort((a, b) => Number(a) - Number(b))
      .map((step) => `--gravity-${ramp}-${step}`);
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

Deno.test("solid content is cut out in the page colour, in both schemes", () => {
  for (const intent of INTENTS) {
    const on = `--gravity-text-on-${intent}`;
    assertEquals(light.get(on), "var(--gravity-surface-1)", on);
    // Dark primary keeps Gravity's blue-600, too dark for a black cut-out.
    if (intent === "primary") {
      assertEquals(dark.get(on), "var(--gravity-white)", on);
      continue;
    }
    assert(!dark.has(on), `${on} is redeclared in dark`);
  }
});

Deno.test("Button content clears 4.5:1 in every state", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (const intent of INTENTS) {
      const on = c(`text-on-${intent}`);
      expectRatio(
        on,
        c(`${intent}-solid`),
        4.5,
        `${scheme} on-${intent} on solid`,
      );
      if (!HOVER_INTENTS.includes(intent)) continue;
      const hover = c(`${intent}-hover`);
      expectRatio(on, hover, 4.5, `${scheme} on-${intent} on hover`);
      // Pressed solid adds brightness(90%) to the hover fill.
      expectRatio(
        dim(on, 0.9),
        dim(hover, 0.9),
        4.5,
        `${scheme} on-${intent} pressed`,
      );
      // Soft, faint and ghost labels are the -strong ink; the next test
      // covers them at rest and on hover.
      const label = c(`${intent}-strong`), muted = c(`${intent}-muted`);
      // Pressed soft adds brightness(95%) to the muted fill.
      expectRatio(
        dim(label, 0.95),
        dim(muted, 0.95),
        4.5,
        `${scheme} ${intent} label pressed`,
      );
    }
  }
});

// Badge, Status, Callout and NavItem draw the strong inks on their own tints.
Deno.test("strong inks clear 4.5:1 on their tints and the page", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (const intent of INTENTS) {
      const strong = c(`${intent}-strong`);
      for (const bg of [`${intent}-subtle`, `${intent}-muted`, ...SURFACES]) {
        expectRatio(strong, c(bg), 4.5, `${scheme} ${intent}-strong on ${bg}`);
      }
    }
  }
});

// A level-2 glyph is the -strong ink, wherever decay puts it.
Deno.test("strong inks clear 3:1 as a glyph on every page, well and tint", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (const intent of INTENTS) {
      for (
        const bg of [
          ...SURFACES,
          ...INTENTS.map((intent) => `${intent}-subtle`),
        ]
      ) {
        expectRatio(
          c(`${intent}-strong`),
          c(bg),
          3,
          `${scheme} ${intent}-strong glyph on ${bg}`,
        );
      }
    }
  }
});

Deno.test("body text clears 4.5:1 on every tint", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (const intent of TINTS) {
      for (const ink of ["text-primary", "text-secondary"]) {
        expectRatio(
          c(ink),
          c(`${intent}-subtle`),
          4.5,
          `${scheme} ${ink} on ${intent}-subtle`,
        );
      }
    }
  }
});

// Wells and tints hold actions (soft Status, Callout, Alert), CodeBlock's panel
// is surface-inverse, and NavItem's inset ring sits on its current and hover
// fills. An idle NavItem's pressed neutral-muted is left out: 2.93:1 in dark.
Deno.test("the focus ring clears 3:1 on everything it is drawn over", () => {
  for (const scheme of ["light", "dark"] as const) {
    const ring = rgb(resolve(scheme, "--color-border-focus"));
    for (
      const surface of new Set([
        ...SURFACES,
        ...WELLS,
        "surface-inverse",
        "primary-subtle",
        "primary-muted",
      ])
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

// Dots and markers draw in -solid, and a control's only edge is
// border-interactive. surface-muted is a fill, never a page, so it is left out.
Deno.test("marks and control edges clear 3:1 on the page and panels", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    const marks = [
      ...INTENTS.map((intent) => `${intent}-solid`),
      "border-interactive",
    ];
    for (const mark of marks) {
      for (const page of PAGES) {
        expectRatio(c(mark), c(page), 3, `${scheme} ${mark} on ${page}`);
      }
    }
    // A selected OptionCard's chip. Dark primary keeps Gravity's blue-600, which
    // sits 2.58:1 off its card; the chip is decorative and the card's own fill
    // and edge carry the selection.
    if (scheme === "light") {
      expectRatio(
        c("primary-solid"),
        c("primary-subtle"),
        3,
        `${scheme} primary-solid on primary-subtle`,
      );
    }
  }
});

Deno.test("Progress fills clear 3:1 on their surface-muted track", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (const intent of ["primary", "info", "success", "warning", "danger"]) {
      // Dark primary keeps Gravity's blue-600 at 2.31:1; Progress documents it
      // and asks for a valueLabel where the exact value matters.
      if (scheme === "dark" && intent === "primary") continue;
      expectRatio(
        c(`${intent}-solid`),
        c("bg-surface-muted"),
        3,
        `${scheme} Progress ${intent} on its track`,
      );
    }
  }
});

// A pulsing Status's IconCircle keeps its -strong glyph, and the pulse dims the
// glyph and its disc together over the box: the deep glaze on the soft box (2),
// the plate glaze on the plate box (1), and no disc or box on the page (0).
Deno.test("the Status glyph clears 3:1 at the trough of its pulse", () => {
  const keyframes = blockAfter(css.search(/@keyframes status-pulse\b/));
  const trough = Math.min(
    ...[...keyframes.matchAll(/opacity:\s*([\d.]+)/g)].map((m) =>
      Number(m[1]) * 100
    ),
  );
  assert(Number.isFinite(trough), "status-pulse sets no opacity");
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (const intent of WELL_TINTS) {
      const levels = [
        {
          where: `on deep over ${intent}-subtle`,
          box: c(`${intent}-subtle`),
          disc: c(`${intent}-solid`),
          percent: DEEP,
        },
        ...PAGES.flatMap((page) => [
          {
            where: `on the plate over ${page}`,
            box: composite(c("bg-plate"), c(page)),
            disc: c("neutral-strong"),
            percent: PLATE_GLAZE,
          },
          { where: `on ${page}`, box: c(page), disc: c(page), percent: 0 },
        ]),
      ];
      for (const { where, box, disc, percent } of levels) {
        expectRatio(
          over(c(`${intent}-strong`), trough, box),
          over(disc, percent * trough / 100, box),
          3,
          `${scheme} ${intent} glyph at ${trough}% ${where}`,
        );
      }
    }
  }
});

Deno.test("raised layers and the selected chip lift off what they sit on", () => {
  for (const scheme of ["light", "dark"] as const) {
    const lum = (token: string) =>
      luminance(rgb(resolve(scheme, `--gravity-${token}`)));
    assert(
      lum("bg-surface-selected") > lum("neutral-subtle"),
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

// A soft field's border stays transparent, so its fill alone shows focus. Only
// its value, placeholder and icons sit on that fill, plus the outline of a
// focused button inside it (clear, reveal).
Deno.test("a focused soft field steps off its resting fill and stays legible", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (
      const [rest, focus] of [
        ["bg-well", "bg-well-active"],
        ["danger-subtle", "danger-muted"],
      ]
    ) {
      expectRatio(c(focus), c(rest), 1.1, `${scheme} ${focus} on ${rest}`);
      const ring = c("well-focus-ring");
      expectRatio(ring, c(focus), 3, `${scheme} inner ring on ${focus}`);
      for (const ink of ["text-primary", "text-secondary"]) {
        expectRatio(c(ink), c(focus), 4.5, `${scheme} ${ink} on ${focus}`);
      }
    }
  }
});

// A faint field has no fill, so its placeholder sits on whatever holds it.
Deno.test("a faint field's placeholder clears 4.5:1 on every page and well", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (const ground of new Set([...PAGES, ...WELLS])) {
      expectRatio(
        c("text-secondary"),
        c(ground),
        4.5,
        `${scheme} text-secondary on ${ground}`,
      );
    }
  }
});

// Reveal, steppers, Select clear and Combobox remove: neutral-strong icons
// over a glaze of their own ink while hovered, pressed or held.
Deno.test("in-field controls keep their icons 3:1 on their glaze", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    const icon = c("neutral-strong");
    for (
      const fill of [
        "bg-well",
        "bg-well-active",
        "danger-subtle",
        "danger-muted",
      ]
    ) {
      for (const percent of [0, GLAZE.rest, GLAZE.press]) {
        expectRatio(
          icon,
          over(icon, percent, c(fill)),
          3,
          `${scheme} in-field icon on its ${percent}% glaze over ${fill}`,
        );
      }
    }
  }
});

Deno.test("filled-well glazes every intent's soft fills and strengthens control edges", () => {
  for (const intent of INTENTS) {
    for (
      const [fill, percent] of [["subtle", GLAZE.rest], [
        "muted",
        GLAZE.press,
      ]] as const
    ) {
      const name = `--color-${intent}-${fill}`;
      assertEquals(
        wellInside.get(name),
        `color-mix(in oklab, var(--color-${intent}-strong) ${percent}%, transparent)`,
        `${name} inside a filled well`,
      );
      assert(!wellSelf.has(name), `${name} is reset on the well itself`);
    }
  }
  assertEquals(
    wellInside.get("--color-border-interactive"),
    "var(--color-border-interactive-strong)",
  );
  assertEquals(
    wellInside.get("--color-border-focus"),
    "var(--color-well-focus-ring)",
  );
});

// Soft fills, and the hover and held fills of faint and ghost, are glazes in
// a filled well. Pressed soft dims the glaze too and is left out.
Deno.test("labels clear 4.5:1 on their glaze in every filled well", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (const intent of INTENTS) {
      const label = c(`${intent}-strong`);
      for (const well of WELLS) {
        for (const percent of [GLAZE.rest, GLAZE.press]) {
          expectRatio(
            label,
            over(label, percent, c(well)),
            4.5,
            `${scheme} ${intent} label on its ${percent}% glaze over ${well}`,
          );
        }
      }
    }
  }
});

// Left off the well itself, so a soft card that is a filled well shows it too.
Deno.test("filled-well glazes the grey well fill it holds", () => {
  for (
    const [name, percent] of [
      ["--color-well", WELL_GLAZE.rest],
      ["--color-well-active", WELL_GLAZE.press],
    ] as const
  ) {
    assertEquals(
      wellInside.get(name),
      `color-mix(in oklab, var(--color-neutral-strong) ${percent}%, transparent)`,
      `${name} inside a filled well`,
    );
    assert(!wellSelf.has(name), `${name} is reset on the well itself`);
  }
});

// A soft OptionCard or InfoCard one well down: its fill, title, description and caret.
Deno.test("a glazed grey well fill shows in every filled well and keeps its text legible", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (const well of WELLS) {
      for (const percent of [WELL_GLAZE.rest, WELL_GLAZE.press]) {
        const fill = over(c("neutral-strong"), percent, c(well));
        const what = `${scheme} ${percent}% grey glaze over ${well}`;
        expectRatio(fill, c(well), 1.1, what);
        expectRatio(c("text-secondary"), fill, 4.5, `${what}: text-secondary`);
        expectRatio(c("text-tertiary"), fill, 3, `${what}: text-tertiary`);
      }
    }
  }
});

Deno.test("control edges clear 3:1 in every filled well", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (const well of WELLS) {
      expectRatio(
        c("border-interactive-strong"),
        c(well),
        3,
        `${scheme} border-interactive-strong on ${well}`,
      );
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

// S2: soft fields and cards separate from page-subtle panels.
Deno.test("the soft well fill steps off page-subtle panels", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    expectRatio(
      c("bg-well"),
      c("bg-page-subtle"),
      1.05,
      `${scheme} bg-well on bg-page-subtle`,
    );
  }
});

// Faint, level 1: soft's shape in grey; the hue lives in the ink.
Deno.test("the faint plate is neutral-strong, between the ground and the soft fill", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    const plate = c("bg-plate"), ink = c("neutral-strong");
    assert(plate[3] < 0.15, `${scheme} plate is not a light glaze`);
    for (let i = 0; i < 3; i++) {
      assert(
        Math.abs(plate[i] - ink[i]) < 1e-9,
        `${scheme} plate is not neutral-strong`,
      );
    }
    for (const page of PAGES) {
      const on = composite(plate, c(page));
      expectRatio(on, c(page), 1.05, `${scheme} plate on ${page}`);
      for (const ink of ["text-primary", "text-quiet", "text-secondary"]) {
        expectRatio(
          c(ink),
          on,
          4.5,
          `${scheme} ${ink} on the plate over ${page}`,
        );
      }
      for (const intent of INTENTS) {
        expectRatio(
          c(`${intent}-strong`),
          on,
          4.5,
          `${scheme} ${intent}-strong on the plate over ${page}`,
        );
      }
    }
    assert(
      ratio(composite(plate, c("surface-1")), c("surface-1")) <
        ratio(c("bg-well"), c("surface-1")),
      `${scheme} the plate is louder than the soft field`,
    );
    for (const well of WELLS) {
      const on = over(ink, PLATE_GLAZE, c(well));
      expectRatio(on, c(well), 1.05, `${scheme} plate glaze on ${well}`);
      for (const text of ["text-quiet", "text-secondary"]) {
        expectRatio(
          c(text),
          on,
          4.5,
          `${scheme} ${text} on the plate glaze over ${well}`,
        );
      }
      for (const intent of INTENTS) {
        expectRatio(
          c(`${intent}-strong`),
          on,
          4.5,
          `${scheme} ${intent}-strong on the plate glaze over ${well}`,
        );
      }
    }
  }
});

Deno.test("filled-well glazes the plate and the field frames it holds", () => {
  for (
    const [name, percent] of [
      ["--color-plate", PLATE_GLAZE],
      ["--color-border-field", FIELD_GLAZE.rest],
      ["--color-border-field-hover", FIELD_GLAZE.hover],
    ] as const
  ) {
    assertEquals(
      wellInside.get(name),
      `color-mix(in oklab, var(--color-neutral-strong) ${percent}%, transparent)`,
      `${name} inside a filled well`,
    );
    assert(!wellSelf.has(name), `${name} is reset on the well itself`);
  }
});

// The level 1 field frame: visible, firmer on hover, and the focus ring stands off it.
Deno.test("the faint field frame shows, firms on hover and yields to focus", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    const grounds: [string, number[], number[], number[]][] = [
      ...PAGES.map((page) =>
        [page, c(page), c("border-field"), c("border-field-hover")] as [
          string,
          number[],
          number[],
          number[],
        ]
      ),
      ...WELLS.map((well) =>
        [
          well,
          c(well),
          over(c("neutral-strong"), FIELD_GLAZE.rest, c(well)),
          over(c("neutral-strong"), FIELD_GLAZE.hover, c(well)),
        ] as [string, number[], number[], number[]]
      ),
    ];
    for (const [name, ground, rest, hover] of grounds) {
      expectRatio(rest, ground, 1.4, `${scheme} frame on ${name}`);
      expectRatio(
        hover,
        rest,
        1.1,
        `${scheme} hover frame against the rest frame on ${name}`,
      );
      const ring = PAGES.includes(name)
        ? c("border-focus")
        : c("well-focus-ring");
      expectRatio(ring, ground, 3, `${scheme} focus ring on ${name}`);
    }
  }
});

Deno.test("quiet titles sit between primary and secondary text and stay legible", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    const lum = (token: string) => luminance(c(token));
    const [fg, quiet, muted] = ["text-primary", "text-quiet", "text-secondary"]
      .map(lum);
    assert(
      (fg - quiet) * (quiet - muted) > 0,
      `${scheme} text-quiet is not between text-primary and text-secondary`,
    );
    for (
      const ground of new Set([
        ...SURFACES,
        ...WELLS,
        ...TINTS.map((i) => `${i}-muted`),
      ])
    ) {
      expectRatio(
        c("text-quiet"),
        c(ground),
        4.5,
        `${scheme} text-quiet on ${ground}`,
      );
    }
  }
});

Deno.test("quiet eyebrows halve the strong ink's chroma and clear 4.5:1 where they sit", () => {
  for (const intent of EYEBROW_INTENTS) {
    assertEquals(
      derived.get(`--color-${intent}-quiet`),
      `oklch(from var(--gravity-${intent}-strong) l calc(c / 2) h)`,
    );
  }
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (const intent of EYEBROW_INTENTS) {
      const quiet = halveChroma(c(`${intent}-strong`));
      for (const ground of new Set([...SURFACES, ...WELLS])) {
        expectRatio(
          quiet,
          c(ground),
          4.5,
          `${scheme} ${intent}-quiet on ${ground}`,
        );
      }
    }
  }
});

// Static parts sit on the full deep glaze; a same-intent soft Button rests at 75% of it.
Deno.test("the deep glaze steps off its own soft fill and keeps the ink legible", () => {
  for (const intent of PART_INTENTS) {
    const source = intent === "primary" ? "border-focus" : `${intent}-solid`;
    assertEquals(
      derived.get(`--color-${intent}-deep`),
      `color-mix(in oklab, var(--gravity-${source}) ${DEEP}%, transparent)`,
    );
  }
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (const intent of PART_INTENTS) {
      const source = c(
        intent === "primary" ? "border-focus" : `${intent}-solid`,
      );
      const ink = c(`${intent}-strong`);
      const soft = intent === "neutral" ? c("bg-well") : c(`${intent}-subtle`);
      expectRatio(
        over(source, DEEP, soft),
        soft,
        1.2,
        `${scheme} ${intent}-deep off its soft fill`,
      );
      for (const percent of [DEEP * 0.75, DEEP]) {
        expectRatio(
          ink,
          over(source, percent, soft),
          4.5,
          `${scheme} ${intent} label on ${percent}% deep`,
        );
      }
      for (const well of WELLS) {
        const glazed = over(
          ink,
          intent === "neutral" ? WELL_GLAZE.rest : GLAZE.rest,
          c(well),
        );
        expectRatio(
          ink,
          over(source, DEEP, glazed),
          3,
          `${scheme} ${intent} glyph on deep over ${well}`,
        );
      }
    }
  }
});

Deno.test("an intent card's hover sits halfway from soft to muted", () => {
  for (const intent of COLOR_INTENTS) {
    assertEquals(
      derived.get(`--color-${intent}-subtle-hover`),
      `color-mix(in oklab, var(--color-${intent}-subtle), var(--color-${intent}-muted))`,
    );
  }
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    for (const intent of COLOR_INTENTS) {
      const hover = mixOklab(c(`${intent}-subtle`), c(`${intent}-muted`));
      expectRatio(
        hover,
        c(`${intent}-subtle`),
        1.05,
        `${scheme} ${intent}-subtle-hover off subtle`,
      );
      for (
        const ink of ["text-primary", "text-secondary", `${intent}-strong`]
      ) {
        expectRatio(
          c(ink),
          hover,
          4.5,
          `${scheme} ${ink} on ${intent}-subtle-hover`,
        );
      }
    }
  }
});

// A chip's or IconCircle's glyph never gets louder as its level drops, and keeps 3:1.
Deno.test("level 1 and 0 glyphs step down the ramp and keep 3:1", () => {
  for (const scheme of ["light", "dark"] as const) {
    const c = (token: string) => rgb(resolve(scheme, `--gravity-${token}`));
    const page = c("surface-1");
    for (const intent of PART_INTENTS) {
      const [strong, faint, ghost] = ["strong", "glyph-faint", "glyph-ghost"]
        .map((step) => c(`${intent}-${step}`));
      assert(
        ratio(strong, page) >= ratio(faint, page) &&
          ratio(faint, page) >= ratio(ghost, page),
        `${scheme} ${intent} glyphs get louder toward level 0`,
      );
      const plate = c("bg-plate");
      for (const ground of PAGES) {
        expectRatio(
          faint,
          composite(plate, c(ground)),
          3,
          `${scheme} ${intent}-glyph-faint on the plate over ${ground}`,
        );
        expectRatio(
          ghost,
          c(ground),
          3,
          `${scheme} ${intent}-glyph-ghost on ${ground}`,
        );
      }
      for (const well of WELLS) {
        expectRatio(
          faint,
          over(c("neutral-strong"), PLATE_GLAZE, c(well)),
          3,
          `${scheme} ${intent}-glyph-faint on the plate glaze over ${well}`,
        );
        expectRatio(
          ghost,
          c(well),
          3,
          `${scheme} ${intent}-glyph-ghost on ${well}`,
        );
      }
    }
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

/** `ink` at `percent` opacity, composited over the opaque `bg`. */
function over(
  ink: number[],
  percent: number,
  bg: number[],
): [number, number, number, number] {
  const mix = (i: number) => (ink[i] * percent + bg[i] * (100 - percent)) / 100;
  return [mix(0), mix(1), mix(2), 1];
}

/** CSS brightness(): a linear slope on the encoded channels. */
function dim(
  [r, g, b, a]: number[],
  k: number,
): [number, number, number, number] {
  return [Math.min(1, r * k), Math.min(1, g * k), Math.min(1, b * k), a];
}

/** An alpha colour composited over the opaque `bg`. */
function composite(
  ink: number[],
  bg: number[],
): [number, number, number, number] {
  return over(ink, ink[3] * 100, bg);
}

function ratio(fg: number[], bg: number[]): number {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

function toOklab([r, g, b]: number[]): [number, number, number] {
  const lin = (c: number) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const [R, G, B] = [r, g, b].map(lin);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([L, a, b]: number[]): [number, number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const gam = (c: number) =>
    Math.min(
      1,
      Math.max(0, c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055),
    );
  return [
    gam(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    gam(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    gam(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    1,
  ];
}

/** oklch(from x l calc(c / 2) h): halving chroma halves a and b. */
function halveChroma(ink: number[]): [number, number, number, number] {
  const [L, a, b] = toOklab(ink);
  return fromOklab([L, a / 2, b / 2]);
}

/** color-mix(in oklab, x, y) at 50%. */
function mixOklab(x: number[], y: number[]): [number, number, number, number] {
  const [p, q] = [toOklab(x), toOklab(y)];
  return fromOklab(p.map((v, i) => (v + q[i]) / 2));
}

function expectRatio(fg: number[], bg: number[], min: number, what: string) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  const ratio = (hi + 0.05) / (lo + 0.05);
  assert(ratio >= min, `${what}: ${ratio.toFixed(2)}:1, needs ${min}:1`);
}
