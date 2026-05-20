import { converter, formatHex, formatHex8, parse, toGamut } from 'culori';

const toOklch = converter('oklch');
const clampToSrgb = toGamut('rgb', 'oklch');

function round(n: number, digits: number): number {
  const m = 10 ** digits;
  return Math.round(n * m) / m;
}

/** Convert "#1a1a1a" (or 8-char "#1a1a1aff") → "oklch(L C H)" or
 *  "oklch(L C H / A)". Achromatic colors pin hue=0 for stable JSON output. */
export function hexToOklch(hex: string): string {
  const parsed = parse(hex);
  if (!parsed) return 'oklch(0 0 0)';
  const c = toOklch(parsed);
  if (!c) return 'oklch(0 0 0)';
  const L = round(c.l ?? 0, 3);
  const C = round(c.c ?? 0, 3);
  const H = c.c && c.c > 0 ? round(c.h ?? 0, 1) : 0;
  const alpha = c.alpha;
  if (typeof alpha === 'number' && alpha < 1) {
    return `oklch(${L} ${C} ${H} / ${round(alpha, 3)})`;
  }
  return `oklch(${L} ${C} ${H})`;
}

/** Convert "oklch(L C H [/ A])" → "#RRGGBB" or "#RRGGBBAA" (gamut-clamped to
 *  sRGB; lossy if input was outside sRGB gamut). Returns "#000000" on parse
 *  failure. */
export function oklchToHex(oklch: string): string {
  const parsed = parse(oklch);
  if (!parsed) return '#000000';
  const clamped = clampToSrgb(parsed);
  const hasAlpha = typeof clamped.alpha === 'number' && clamped.alpha < 1;
  if (hasAlpha) return formatHex8(clamped) ?? '#000000';
  return formatHex(clamped) ?? '#000000';
}

/** True when round-tripping through hex loses ≥1% L or C precision — signals
 *  to UI that the swatch is showing an approximation. Kept for future use
 *  (e.g. if we add an OKLCH literal input). Hex picker never reaches this. */
export function isGamutClamped(oklch: string): boolean {
  const parsed = parse(oklch);
  if (!parsed) return false;
  const inOklch = toOklch(parsed);
  const clamped = clampToSrgb(parsed);
  const clampedOklch = toOklch(clamped);
  if (!inOklch || !clampedOklch) return false;
  const deltaL = Math.abs((inOklch.l ?? 0) - (clampedOklch.l ?? 0));
  const deltaC = Math.abs((inOklch.c ?? 0) - (clampedOklch.c ?? 0));
  return deltaL > 0.01 || deltaC > 0.01;
}
