export type Level = (typeof ENERGY)[number];
/** Counts from the component's potential, where it sits on the blank page: `"-1"` is one level below it. */
export type Shift = `${"+" | "-"}${1 | 2 | 3}`;
/** An absolute level of the component's range, or a shift from its potential. */
export type Energy<L extends Level = Level> = L | Shift;
export type Shape = (typeof SHAPES)[number];

/** Energy levels, highest first: 3 solid, 2 soft, 1 faint, 0 ghost. */
export const ENERGY = ["3", "2", "1", "0"] as const;
export const SHAPES = ["rounded", "pill"] as const;

/** The level an element shows in a well `depth` levels deep, given `energy` and its component's `range` (potential first, ground last): one level lower per well, kept within the range. */
export function resolveEnergy<const R extends readonly Level[]>(
  energy: Energy<R[number]> | undefined,
  range: R,
  depth = 0,
): R[number] {
  const potential = Number(range[0]);
  const ground = Number(range[range.length - 1]);
  const given = energy === undefined
    ? potential
    : energy[0] === "+" || energy[0] === "-"
    ? potential + Number(energy)
    : Number(energy);
  return String(Math.min(potential, Math.max(ground, given - depth))) as R[
    number
  ];
}
