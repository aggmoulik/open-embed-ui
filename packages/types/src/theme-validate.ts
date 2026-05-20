/**
 * Strict OKLCH literal validator. Accepts:
 *   oklch(L C H)        — e.g. "oklch(0.629 0.149 159.6)"
 *   oklch(L C H / A)    — alpha 0-1, e.g. "oklch(1 0 0 / 0.1)"
 *   oklch(L C H / A%)   — alpha percent, e.g. "oklch(1 0 0 / 10%)"
 *
 * Rejects anything containing CSS-syntax-significant chars (`;`, `{`, `}`,
 * comment markers, calc(), var(), URLs, or any whitespace beyond the single
 * spaces between L/C/H/A). 50-char length cap is a belt-and-braces safeguard
 * against pathological inputs that pass the regex.
 *
 * Used at TWO points (must agree):
 *   1. Dashboard PATCH/POST routes — reject the save with a 400 if every
 *      value in a sparse override map fails.
 *   2. Widget runtime serializer — silently drop invalid values, fall back
 *      to bundled defaults. The widget can't 400; it just refuses injection.
 */
const NUM = String.raw`(?:\d+\.?\d*|\.\d+)`;
const OKLCH_RE = new RegExp(
  `^oklch\\(\\s*${NUM}\\s+${NUM}\\s+${NUM}(?:\\s*\\/\\s*${NUM}%?)?\\s*\\)$`,
);

export function isValidOklch(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 50 && OKLCH_RE.test(value);
}

/** Drop invalid keys from a sparse override map. Used by the PATCH/POST
 *  routes to clean user input before persisting. Returns `undefined` if no
 *  keys survived (so callers can `delete` the parent key). */
export function sanitizeOverrides<T extends Record<string, string>>(
  overrides: Partial<T> | undefined,
): Partial<T> | undefined {
  if (!overrides) return undefined;
  const out: Partial<T> = {};
  let kept = 0;
  for (const [k, v] of Object.entries(overrides)) {
    if (isValidOklch(v)) {
      (out as Record<string, string>)[k] = v;
      kept++;
    }
  }
  return kept > 0 ? out : undefined;
}
