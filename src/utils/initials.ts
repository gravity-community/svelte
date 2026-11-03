/**
 * Two-letter monogram: the first letters of the first two words, or the first
 * two letters of a single word ("Jane Novak" → "JN", "Interzone" → "IN").
 * "?" for a blank name.
 */
export function initialsOf(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  // Spread, not slice, so an astral character isn't cut in half.
  const letters = words.length === 1
    ? [...words[0]].slice(0, 2)
    : words.slice(0, 2).map((word) => [...word][0]);
  return letters.join("").toUpperCase();
}
