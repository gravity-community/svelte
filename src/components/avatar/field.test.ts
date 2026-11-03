import { assert, assertEquals, assertMatch } from "@std/assert";
import {
  type AvatarField,
  avatarField,
  type AvatarVariant,
  type FieldGeometry,
  fieldStyle,
  seedHash,
} from "./field.ts";

// UUIDs that differ only in the last block: the clustering case FNV must survive.
const SEEDS = Array.from(
  { length: 2000 },
  (_, i) => `3f2a91c4-6b7d-4e1f-9c3a-${i.toString(16).padStart(12, "0")}`,
);
const ADA = "0f8b1d24-6c3a-4e59-9b07-2d4a6f8c1e30";
const HUE_STEPS = 12;
const STEP_DEG = 30;
const MIN_SEPARATION_DEG = 90;
const STOP =
  /^oklch\(var\(--gravity-avatar-l(-deep)?\) var\(--gravity-avatar-c\) (\d+)\)$/;

const hueOf = (stop: string): number => {
  const m = STOP.exec(stop);
  assert(m, `${stop} is not an avatar stop`);
  return Number(m[2]);
};
const isDeep = (stop: string): boolean => Boolean(STOP.exec(stop)?.[1]);

/** Circular distance between two hue angles, in degrees. */
const apart = (a: number, b: number): number => {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
};

const forEachVariant = (
  fn: (variant: AvatarVariant, field: AvatarField) => void,
) => {
  for (const variant of ["mono", "duo"] as const) {
    for (const seed of SEEDS) fn(variant, avatarField(seed, variant));
  }
};

Deno.test("same id and variant yield the same field", () => {
  assertEquals(avatarField(ADA, "duo"), avatarField(ADA, "duo"));
  assertEquals(seedHash(ADA), seedHash(ADA));
});

Deno.test("stops are token references, never colour literals", () => {
  forEachVariant((_variant, f) => {
    assertMatch(f.from, STOP);
    assertMatch(f.to, STOP);
  });
});

Deno.test("every hue is one of the twelve 30 degree steps", () => {
  forEachVariant((_variant, f) => {
    for (const hue of [hueOf(f.from), hueOf(f.to)]) {
      assertEquals(hue % STEP_DEG, 0, `${hue} is not a step`);
      assert(hue >= 0 && hue < 360, `${hue} out of range`);
    }
  });
});

Deno.test("every hue is reachable, and none dominates", () => {
  const counts = new Map<number, number>();
  for (const seed of SEEDS) {
    const hue = hueOf(avatarField(seed, "duo").from);
    counts.set(hue, (counts.get(hue) ?? 0) + 1);
  }
  assertEquals(counts.size, HUE_STEPS);
  // A fair 12-way split is 1/12; allow a wide band and still catch a collapse.
  for (const [hue, n] of counts) {
    const share = n / SEEDS.length;
    assert(
      share > 0.04 && share < 0.14,
      `${hue}° took ${(share * 100).toFixed(1)}%`,
    );
  }
});

Deno.test("a duo field's two hues are at least 90 degrees apart", () => {
  for (const seed of SEEDS) {
    const f = avatarField(seed, "duo");
    const gap = apart(hueOf(f.from), hueOf(f.to));
    assert(
      gap >= MIN_SEPARATION_DEG,
      `${seed}: ${hueOf(f.from)}° and ${hueOf(f.to)}° are only ${gap}° apart`,
    );
  }
});

Deno.test("a mono field is one hue, darkening", () => {
  for (const seed of SEEDS) {
    const f = avatarField(seed, "mono");
    assertEquals(
      hueOf(f.from),
      hueOf(f.to),
      `${seed} drew a mono field with two hues`,
    );
    // Light stop first, so the contrast floor is the measured base lightness.
    assert(!isDeep(f.from), `${seed}: mono field opens on the deep stop`);
    assert(isDeep(f.to), `${seed}: mono field does not darken`);
    assertEquals(f.geometry, "linear");
  }
});

Deno.test("only the mono grammar draws a deep stop", () => {
  for (const seed of SEEDS) {
    const f = avatarField(seed, "duo");
    assert(!isDeep(f.from) && !isDeep(f.to), `${seed}: duo drew a deep stop`);
  }
});

Deno.test("all three geometries are reachable for duo fields", () => {
  const seen = new Set<FieldGeometry>();
  for (const seed of SEEDS) seen.add(avatarField(seed, "duo").geometry);
  assertEquals(seen.size, 3);
});

Deno.test("angles are the eight 45 degree steps", () => {
  const seen = new Set<number>();
  for (const seed of SEEDS) {
    const { angle } = avatarField(seed, "duo");
    assertEquals(angle % 45, 0, `${angle} is not a multiple of 45`);
    assert(angle >= 0 && angle < 360, `${angle} out of range`);
    seen.add(angle);
  }
  assertEquals(seen.size, 8);
});

Deno.test("hue pair, angle and geometry vary independently", () => {
  const angles = new Map<string, Set<number>>();
  const geoms = new Map<string, Set<FieldGeometry>>();
  for (const seed of SEEDS) {
    const f = avatarField(seed, "duo");
    const key = `${hueOf(f.from)}->${hueOf(f.to)}`;
    if (!angles.has(key)) angles.set(key, new Set());
    if (!geoms.has(key)) geoms.set(key, new Set());
    angles.get(key)!.add(f.angle);
    geoms.get(key)!.add(f.geometry);
  }
  const lockedAngle = [...angles].filter(([, a]) => a.size === 1);
  const lockedGeom = [...geoms].filter(([, g]) => g.size === 1);
  assertEquals(
    lockedAngle.length,
    0,
    `pairs locked to one angle: ${lockedAngle.map(([k]) => k)}`,
  );
  assertEquals(
    lockedGeom.length,
    0,
    `pairs locked to one geometry: ${lockedGeom.map(([k]) => k)}`,
  );
});

Deno.test("style string is a single background-image per geometry", () => {
  const of = (geometry: FieldGeometry) => {
    const seed = SEEDS.find((s) => avatarField(s, "duo").geometry === geometry);
    assert(seed, `no seed produced a ${geometry} field`);
    return avatarField(seed, "duo");
  };
  const lin = of("linear");
  assertEquals(
    fieldStyle(lin),
    `background-image:linear-gradient(${lin.angle}deg,${lin.from},${lin.to})`,
  );
  const con = of("conic");
  assertEquals(
    fieldStyle(con),
    `background-image:conic-gradient(from ${con.angle}deg,${con.from},${con.to},${con.from})`,
  );
  // The radial centre follows the angle, so only its shape is fixed.
  assertMatch(
    fieldStyle(of("radial")),
    /^background-image:radial-gradient\(circle at \d+% \d+%,oklch\(.+\),oklch\(.+\)\)$/,
  );
});

// Contrast floor, measured against variables.css itself.

const CSS = await Deno.readTextFile(
  new URL("../../styles/variables.css", import.meta.url),
);

/** Every declared value of one custom property, in source order: light, dark. */
function declared(name: string): number[] {
  const matches = [
    ...CSS.matchAll(new RegExp(`--gravity-${name}:\\s*([^;]+);`, "g")),
  ];
  assert(matches.length > 0, `variables.css declares no --gravity-${name}`);
  return matches.map((m) => {
    const raw = m[1].trim();
    return raw.endsWith("%") ? Number(raw.slice(0, -1)) / 100 : Number(raw);
  });
}

function oklchToLinear(L: number, C: number, hDeg: number): number[] {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

/** WCAG contrast of white text on an OKLCH colour, sRGB-clipped like a browser. */
function whiteOn(L: number, C: number, hue: number): number {
  const [r, g, b] = oklchToLinear(L, C, hue).map((u) =>
    Math.min(1, Math.max(0, u))
  );
  return 1.05 / (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05);
}

Deno.test("variables.css declares the field palette for both schemes", () => {
  assertEquals(declared("avatar-l").length, 2, "light and dark lightness");
  assertEquals(declared("avatar-l-deep").length, 2, "light and dark deep stop");
  assertEquals(declared("avatar-c").length, 1, "chroma holds across schemes");
});

Deno.test("white text clears 4.5:1 at every hue, in both schemes", () => {
  const [c] = declared("avatar-c");
  for (
    const [scheme, l] of Object.entries({
      light: declared("avatar-l")[0],
      dark: declared("avatar-l")[1],
    })
  ) {
    for (let i = 0; i < HUE_STEPS; i++) {
      const hue = i * STEP_DEG;
      const ratio = whiteOn(l, c, hue);
      assert(
        ratio >= 4.5,
        `${scheme} ${hue}°: white text measures ${ratio.toFixed(2)}:1`,
      );
    }
  }
});

// The deep stop is never measured, so it must only raise the ratio.
Deno.test("the mono field's deep stop is darker than the base", () => {
  const base = declared("avatar-l");
  const deep = declared("avatar-l-deep");
  for (const [i, scheme] of ["light", "dark"].entries()) {
    assert(
      deep[i] < base[i],
      `${scheme}: deep stop ${deep[i]} is not below the base ${base[i]}`,
    );
  }
});
