/**
 * Helpers for the optional user-authored `blogUrl` field on contributions
 * (feature 11). Shared between the dashboard preview and the embedded
 * widget so both surfaces resolve the link target identically.
 *
 * URL safety (filtering `javascript:` / `data:` schemes) is the caller's
 * responsibility — both surfaces apply `safeHref()` at render time.
 */

interface BlogFields {
  blogUrl?: string | null;
  /** Defaults to `true` (open in new tab) when undefined — matches the DB default. */
  blogOpenInNewTab?: boolean;
}

export function hasBlog(c: BlogFields): boolean {
  return !!(c.blogUrl && c.blogUrl.trim());
}

export interface BlogTarget {
  href: string;
  target: '_blank' | '_self';
  /** Only set when `target` is `_blank` (security best practice). */
  rel?: string;
}

export function getBlogTarget(c: BlogFields): BlogTarget | null {
  if (!hasBlog(c)) return null;
  const newTab = c.blogOpenInNewTab !== false;
  return {
    href: c.blogUrl!,
    target: newTab ? '_blank' : '_self',
    rel: newTab ? 'noopener noreferrer' : undefined,
  };
}
