import { BookOpen, GitPullRequest } from './icons';
import { getBlogTarget, getDisplayLabels, getLabelColor } from '@open-embed-ui/types';
import type { BaseContribution as Contribution } from '@open-embed-ui/types';
import { safeHref, safeImgSrc } from '@open-embed-ui/types';

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
  // Card-family layouts only show user-set labels. Receipt/CLI families lean on
  // auto-detection as part of their aesthetic; cards stay cleaner.
  const labels =
    showLabels && c.labels && c.labels.length > 0 ? getDisplayLabels(displayTitle, c.labels) : [];
  const blog = getBlogTarget(c);

  return (
    <div
      className={`border-border bg-background hover:border-foreground/30 group rounded-xl border p-3.5 transition-all hover:-translate-y-px hover:shadow-[0_1px_0_rgba(0,0,0,.02),0_4px_16px_rgba(0,0,0,.05)] ${
        uniform ? 'flex h-full flex-col' : ''
      }`}
    >
      <div className={`flex gap-3 ${uniform ? 'flex-1' : ''}`}>
        <GitPullRequest className="text-violet mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
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
                    className="rounded-sm px-1.5 py-px font-mono text-[10px] font-semibold tracking-[0.06em] text-white uppercase"
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
              className={`text-foreground line-clamp-1 font-medium tracking-[-0.005em] underline-offset-2 group-hover:underline ${
                compact ? 'text-[12px]' : 'text-[14px]'
              }`}
            >
              {displayTitle}
            </a>
            {blog && (
              <a
                href={safeHref(blog.href)}
                target={blog.target}
                rel={blog.rel}
                className="text-muted-foreground/70 hover:text-foreground mt-0.5 shrink-0 transition-colors"
                aria-label="Read blog post"
                title="Read blog post"
              >
                <BookOpen className="size-3.5" strokeWidth={1.75} />
              </a>
            )}
          </div>

          <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px]">
            <a
              href={safeHref(`https://github.com/${c.repo}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <img
                src={safeImgSrc(avatarUrl)}
                alt={c.repoOwner}
                className="size-3.5 rounded-full"
                loading="lazy"
              />
              {c.repo}
            </a>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-brand">+{c.additions}</span>
            <span className="text-danger">−{c.deletions}</span>
            {c.mergedAt && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <time
                  dateTime={new Date(c.mergedAt).toISOString()}
                  className="text-muted-foreground/80"
                >
                  {new Date(c.mergedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
              </>
            )}
          </div>

          {showDescription && (c.description || uniform) && (
            <p
              className="text-muted-foreground mt-2.5 line-clamp-2 text-[12px] leading-[1.55]"
              style={uniform ? { minHeight: '32px' } : undefined}
            >
              {c.description ?? ' '}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
