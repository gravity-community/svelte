// Twelve evenly spaced OKLCH hues at one lightness, so white text holds one
// contrast ratio all the way round. Lightness and chroma differ per scheme and
// live in variables.css (--gravity-avatar-*); field.test.ts fails if any hue
// drops white text under 4.5:1.

/** The field's grammar: `mono` is one hue darkening, `duo` two hues at least 90° apart. */
export type AvatarVariant = "mono" | "duo";

export type FieldGeometry = "linear" | "conic" | "radial";

export type AvatarField = {
  from: string;
  to: string;
  angle: number;
  geometry: FieldGeometry;
};

const HUE_STEPS = 12;
const STEP_DEG = 360 / HUE_STEPS;
// 90°: a duo field never smears two neighbouring hues into one.
const MIN_SEPARATION = 3;
const PARTNERS = HUE_STEPS - 2 * MIN_SEPARATION + 1;
const ANGLE_STEPS = 8;
const GEOMETRIES: readonly FieldGeometry[] = ["linear", "conic", "radial"];
const RADIAL_OFFSET = 34; // % from the centre

/** FNV-1a: spreads short, near-identical seeds evenly. */
export function seedHash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function avatarField(seed: string, variant: AvatarVariant): AvatarField {
  const h = seedHash(seed);
  return variant === "mono" ? mono(h) : duo(h);
}

/** A whole style string: deno fmt can't parse `{expr}` inside a Svelte `style` attribute. */
export function fieldStyle(f: AvatarField): string {
  return `background-image:${gradient(f)}`;
}

const stop = (hue: number, deep = false) =>
  `oklch(var(--gravity-avatar-l${
    deep ? "-deep" : ""
  }) var(--gravity-avatar-c) ${hue})`;

// Only ever darkens: the light stop keeps the measured contrast floor.
function mono(h: number): AvatarField {
  const hue = (h % HUE_STEPS) * STEP_DEG;
  return {
    from: stop(hue),
    to: stop(hue, true),
    angle: ((h >>> 20) % ANGLE_STEPS) * (360 / ANGLE_STEPS),
    geometry: "linear",
  };
}

// Each axis reads its own high bits so pair, angle and geometry vary independently.
function duo(h: number): AvatarField {
  const a = h % HUE_STEPS;
  const b = (a + MIN_SEPARATION + ((h >>> 7) % PARTNERS)) % HUE_STEPS;
  return {
    from: stop(a * STEP_DEG),
    to: stop(b * STEP_DEG),
    angle: ((h >>> 20) % ANGLE_STEPS) * (360 / ANGLE_STEPS),
    geometry: GEOMETRIES[(h >>> 14) % GEOMETRIES.length],
  };
}

function gradient(f: AvatarField): string {
  switch (f.geometry) {
    case "conic":
      // Repeating `from` closes the sweep without a seam.
      return `conic-gradient(from ${f.angle}deg,${f.from},${f.to},${f.from})`;
    case "radial": {
      const rad = (f.angle * Math.PI) / 180;
      const x = Math.round(50 + RADIAL_OFFSET * Math.cos(rad));
      const y = Math.round(50 + RADIAL_OFFSET * Math.sin(rad));
      return `radial-gradient(circle at ${x}% ${y}%,${f.from},${f.to})`;
    }
    case "linear":
      return `linear-gradient(${f.angle}deg,${f.from},${f.to})`;
  }
}
