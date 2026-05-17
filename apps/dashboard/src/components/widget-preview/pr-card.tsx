import { BookOpen, GitPullRequest } from 'lucide-react';
import { getBlogTarget, getDisplayLabels, getLabelColor } from '@open-embed-ui/types';
import type { Contribution } from '@/types';
import { safeHref, safeImgSrc } from '@/lib/validation/contribution';

interface PRCardProps {
  contribution: Contribution;
  compact?: boolean;
  titleOverride?: string;
  /** When false, suppress description even if present. Defaults to true. */
  showDescription?: boolean;
  /** When false, suppress label badges even if user-set. Defaults to true. */
  showLabels?: boolean;
  /**
   * Reserve fixed vertical space for optional fields (badge row + description)
   * even when absent, so every card in a row has identical height and the
   * inner elements align across cards. Used by marquee to avoid jagged
   * rows. Also makes the card stretch to fill its flex parent (h-full).
   */
  uniform?: boolean;
}

export function PRCard({
  contribution,
  compact,
  titleOverride,
  showDescription = true,
  showLabels = true,
  uniform = false,
}: PRCardProps) {
  const c = contribution;
  const displayTitle = c.titleOverride || titleOverride || c.title;
  const avatarUrl = `https://github.com/${c.repoOwner}.png?size=32`;
  // Only render labels in card layouts when the user has explicitly set them.
  // Receipt-family layouts (terminal/log/etc.) use the auto-detect fallback as
  // part of their CLI aesthetic; card-family stays cleaner unless opted in.
  const labels =
    showLabels && c.labels && c.labels.length > 0 ? getDisplayLabels(displayTitle, c.labels) : [];
  const blog = getBlogTarget(c);

  return (
    <div
      className={`border-border bg-card hover:bg-muted/50 rounded-lg border p-3 transition-colors ${uniform ? 'flex h-full flex-col' : ''}`}
    >
      <div className={`flex gap-2.5 ${uniform ? 'flex-1' : ''}`}>
        <GitPullRequest className="mt-0.5 size-4 shrink-0 text-purple-500" />
        <div className="min-w-0 flex-1">
          {(labels.length > 0 || uniform) && (
            <div
              className="mb-1.5 flex flex-wrap gap-1"
              style={uniform ? { minHeight: '18px' } : undefined}
            >
              {labels.map((label) => {
                const color = getLabelColor(label);
                return (
                  <span
                    key={label}
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white uppercase"
                    style={{ backgroundColor: color.light }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          )}
          <div className="flex items-start gap-1.5">
            <a
              href={safeHref(c.url)}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-medium hover:underline ${compact ? 'text-xs' : 'text-sm'} line-clamp-1`}
            >
              {displayTitle}
            </a>
            {blog && (
              <a
                href={safeHref(blog.href)}
                target={blog.target}
                rel={blog.rel}
                className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0 transition-colors"
                aria-label="Read blog post"
                title="Read blog post"
              >
                <BookOpen className="size-3.5" />
              </a>
            )}
          </div>
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            <a
              href={safeHref(`https://github.com/${c.repo}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline"
            >
              <img
                src={safeImgSrc(avatarUrl)}
                alt={c.repoOwner}
                className="size-4 rounded-full"
                loading="lazy"
              />
              {c.repo}
            </a>
            <span className="text-green-600">+{c.additions}</span>
            <span className="text-red-600">-{c.deletions}</span>
            {c.mergedAt && (
              <time dateTime={new Date(c.mergedAt).toISOString()}>
                {new Date(c.mergedAt).toLocaleDateString()}
              </time>
            )}
          </div>
          {showDescription && (c.description || uniform) && (
            <p
              className="text-muted-foreground mt-2 line-clamp-2 text-xs leading-relaxed"
              style={uniform ? { minHeight: '32px' } : undefined}
            >
              {c.description ?? ' '}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
