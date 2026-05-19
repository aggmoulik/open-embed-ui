import { BookOpen, GitPullRequest } from 'lucide-react';
import { getBlogTarget, getDisplayLabels, getLabelColor } from '@open-embed-ui/types';
import type { Contribution } from '@/types';
import { safeHref, safeImgSrc } from '@/lib/validation/contribution';

interface TimelineLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function TimelineLayout({ contributions, titleOverrides }: TimelineLayoutProps) {
  if (contributions.length === 0) return <EmptyState />;

  return (
    <div className="relative space-y-0">
      <div className="bg-border absolute top-2 bottom-2 left-[14px] w-px" />
      {contributions.map((c, i) => {
        const displayTitle = c.titleOverride || titleOverrides?.[c.id] || c.title;
        const avatarUrl = `https://github.com/${c.repoOwner}.png?size=32`;
        const labels =
          c.labels && c.labels.length > 0 ? getDisplayLabels(displayTitle, c.labels) : [];
        const blog = getBlogTarget(c);
        const isLast = i === contributions.length - 1;
        return (
          <div
            key={c.id}
            className={`relative flex gap-4 py-3.5 pl-1 ${
              isLast ? '' : 'border-border border-b border-dashed'
            }`}
          >
            <div className="bg-background border-border text-violet relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border">
              <GitPullRequest className="size-3.5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              {labels.length > 0 && (
                <div className="mb-1.5 flex flex-wrap gap-1">
                  {labels.map((label) => {
                    const color = getLabelColor(label);
                    return (
                      <span
                        key={label}
                        className="rounded-sm px-1.5 py-px font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-white"
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
                  className="text-foreground line-clamp-1 text-[14px] font-medium underline-offset-2 hover:underline"
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
              <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px]">
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
              {c.description && (
                <p className="text-muted-foreground mt-2 line-clamp-2 text-[12px] leading-[1.55]">
                  {c.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border-border bg-muted/20 text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center font-mono text-[12px]">
      <span className="text-brand">●</span>
      <span className="mt-1.5">No contributions match these filters.</span>
    </div>
  );
}
