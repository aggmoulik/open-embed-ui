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
      <div className="bg-border absolute top-0 bottom-0 left-4 w-px" />
      {contributions.map((c) => {
        const displayTitle = c.titleOverride || titleOverrides?.[c.id] || c.title;
        const avatarUrl = `https://github.com/${c.repoOwner}.png?size=32`;
        const labels = c.labels && c.labels.length > 0 ? getDisplayLabels(displayTitle, c.labels) : [];
        const blog = getBlogTarget(c);
        return (
          <div key={c.id} className="relative flex gap-4 py-3 pl-1">
            <div className="bg-card relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border">
              <GitPullRequest className="size-3.5 text-purple-500" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              {labels.length > 0 && (
                <div className="mb-1 flex flex-wrap gap-1">
                  {labels.map((label) => {
                    const color = getLabelColor(label);
                    return (
                      <span
                        key={label}
                        className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white"
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
                  className="line-clamp-1 text-sm font-medium hover:underline"
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
              <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 text-xs">
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
              {c.description && (
                <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs leading-relaxed">
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
    <div className="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm">
      No contributions match these filters.
    </div>
  );
}
