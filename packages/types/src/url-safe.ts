/**
 * Defense-in-depth URL sanitizers shared across dashboard and widget.
 *
 * The dashboard's API write boundary already rejects unsafe schemes
 * (see `apps/dashboard/src/lib/validation/contribution.ts#isSafeHttpUrl`)
 * but the widget can also load data from arbitrary static JSON via the
 * `data-src` attribute. We sanitize at render time so a poisoned static
 * payload cannot inject `javascript:` / `data:` / `vbscript:` URLs into
 * `<a href>` or `<img src>`.
 *
 * Edge-runtime safe (uses the global `URL` constructor — Web API available
 * in Node, Cloudflare Workers, Deno, and browsers).
 */

/**
 * Returns true iff `value` parses as a URL with an http or https scheme.
 * Rejects `javascript:`, `data:`, `vbscript:`, `file:`, and any other
 * scheme that could be used for XSS or local-resource access.
 */
export function isSafeHttpUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

/**
 * Returns the URL if it parses as http(s); otherwise '#'. Use for
 * `<a href={safeHref(...)}>` defense-in-depth at render time, even
 * when the API write boundary already rejects unsafe schemes.
 *
 * Accepts undefined/null/empty for ergonomics — empty input returns '#'
 * so the link is non-clickable but the surrounding markup is unchanged.
 */
export function safeHref(value: string | undefined | null): string {
  if (!value) return '#';
  return isSafeHttpUrl(value) ? value : '#';
}

/**
 * Returns the URL if it parses as http(s); otherwise empty string.
 * Use for `<img src={safeImgSrc(...)}>` so the browser does not render
 * a broken-image icon for a `#` src.
 */
export function safeImgSrc(value: string | undefined | null): string {
  if (!value) return '';
  return isSafeHttpUrl(value) ? value : '';
}
