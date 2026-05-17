/**
 * Blog helpers for widget rendering.
 *
 * Mirror of `packages/types/src/blog.ts`. Duplicated because the widget's
 * rollup build can't transpile raw .ts files from the types package.
 * If signatures change, update both files in lockstep.
 */

interface BlogFields {
  blogUrl?: string | null;
  blogOpenInNewTab?: boolean;
}

export function hasBlog(c: BlogFields): boolean {
  return !!(c.blogUrl && c.blogUrl.trim());
}

export interface BlogTarget {
  href: string;
  target: '_blank' | '_self';
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
