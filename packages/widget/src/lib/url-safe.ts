/**
 * Defense-in-depth URL sanitizer for the embedded widget.
 *
 * The dashboard's API write boundary already rejects unsafe schemes
 * (see `apps/dashboard/src/lib/validation/contribution.ts#isSafeHttpUrl`)
 * but the widget can also load data from arbitrary static JSON via the
 * `data-src` attribute. We sanitize at render time so a poisoned static
 * payload cannot inject `javascript:` / `data:` / `vbscript:` URLs into
 * `<a href>` or `<img src>`.
 */

const SAFE_FALLBACK = '#';

/**
 * Returns the URL if it parses as http(s); otherwise '#'.
 *
 * Accepts undefined/null/empty for ergonomics — empty input returns '#'
 * so the link is non-clickable but the surrounding markup is unchanged.
 */
export function safeHref(url: string | undefined | null): string {
  if (!url) return SAFE_FALLBACK;
  try {
    const u = new URL(url);
    if (u.protocol === 'http:' || u.protocol === 'https:') return url;
  } catch {
    // fall through
  }
  return SAFE_FALLBACK;
}

/**
 * Same as safeHref, but for `<img src>` — returns empty string on
 * unsafe input so the browser doesn't render a broken-image icon for
 * a `#` src.
 */
export function safeImgSrc(url: string | undefined | null): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (u.protocol === 'http:' || u.protocol === 'https:') return url;
  } catch {
    // fall through
  }
  return '';
}
