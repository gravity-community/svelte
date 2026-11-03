/**
 * Force falloff: maps field proximity t ∈ [0, 1] (0 at the field edge, 1 at the
 * border and inside) to a strength, clamped to [0, 1]. Return ~0 at t = 0 or
 * the element pops as the pointer crosses the field edge.
 */
export type ForceShape = (proximity: number) => number;

export type GravityOptions = {
  /** Max pitch (rotateX), deg. Max yaw is scaled by height/width, so wide elements don't yaw harder than they pitch. */
  maxTilt?: number;
  /** Field reach past the border box, px. Default: the element's height. */
  reach?: number;
  /** translateZ at the element's centre, where tilt is zero, px. */
  lift?: number;
  /** Tilt spring. */
  spring?: { stiffness: number; damping: number };
  /** Default: smoothstep. `(t) => t * t` feels denser, more gravity-like. */
  shape?: ForceShape;
  /** Inert while true: stays registered, springs settle home, no inline styles. */
  disabled?: boolean;
  /** Draws the field boundary and the pointer in a shared overlay. */
  debug?: boolean;
};

/** `true` or omitted for the defaults, `false` for inert. */
export type GravityParameter = GravityOptions | boolean | undefined;

export type ResolvedGravityParams = {
  maxTilt: number;
  /** null: derived from the element's height at measure time. */
  reach: number | null;
  lift: number;
  stiffness: number;
  damping: number;
  /** undefined: smoothstep. */
  shape: ForceShape | undefined;
  disabled: boolean;
  debug: boolean;
};

/** Identity constants: tune them in Storybook (Foundations/Motion & Gravity) together with the Figma motion spec. */
export const GRAVITY_DEFAULTS = {
  /** deg */
  maxTilt: 12,
  /** px of translateZ at the centre */
  lift: 48,
  /** px, per element: each one is its own gravity well */
  perspective: 600,
  /** s⁻² */
  stiffness: 360,
  /** s⁻¹ (ζ ≈ 0.55) */
  damping: 21,
  /** Overdamped on purpose: a bouncing lift reads as a toy. */
  liftStiffness: 360,
  liftDamping: 34,
  /** px bounds of the height-derived default reach */
  reachMin: 0,
  reachMax: Infinity,
} as const;
