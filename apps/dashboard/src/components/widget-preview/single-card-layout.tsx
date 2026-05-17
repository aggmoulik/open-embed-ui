import { BookOpen, GitPullRequest } from 'lucide-react';
import { getBlogTarget, getDisplayLabels, getLabelColor } from '@open-embed-ui/types';
import type { Contribution } from '@/types';
import { safeHref, safeImgSrc } from '@/lib/validation/contribution';

interface SingleCardLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function SingleCardLayout({ contributions, titleOverrides }: SingleCardLayoutProps) {
  const pr = contributions[0];
  if (!pr) return <EmptyState />;

  const displayTitle = pr.titleOverride || titleOverrides?.[pr.id] || pr.title;
  const avatarUrl = `https://github.com/${pr.repoOwner}.png?size=64`;
  const labels = pr.labels && pr.labels.length > 0 ? getDisplayLabels(displayTitle, pr.labels) : [];
  const blog = getBlogTarget(pr);

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
          <GitPullRequest className="size-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="min-w-0 flex-1">
          {labels.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {labels.map((label) => {
                const color = getLabelColor(label);
                return (
                  <span
                    key={label}
                    className="rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white"
                    style={{ backgroundColor: color.light }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          )}
          <div className="flex items-start gap-2">
            <a
              href={safeHref(pr.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold hover:underline"
            >
              {displayTitle}
            </a>
            {blog && (
              <a
                href={safeHref(blog.href)}
                target={blog.target}
                rel={blog.rel}
                className="text-muted-foreground hover:text-foreground mt-1 shrink-0 transition-colors"
                aria-label="Read blog post"
                title="Read blog post"
              >
                <BookOpen className="size-4" />
              </a>
            )}
          </div>
          <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 text-sm">
            <a
              href={safeHref(`https://github.com/${pr.repo}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-medium hover:underline"
            >
              <img
                src={safeImgSrc(avatarUrl)}
                alt={pr.repoOwner}
                className="size-5 rounded-full"
                loading="lazy"
              />
              {pr.repo}
            </a>
            <span className="text-green-600">+{pr.additions}</span>
            <span className="text-red-600">-{pr.deletions}</span>
            <span>{pr.changedFiles} files</span>
          </div>
          {pr.mergedAt && (
            <p className="text-muted-foreground mt-1 text-xs">
              Merged on{' '}
              <time dateTime={new Date(pr.mergedAt).toISOString()}>
                {new Date(pr.mergedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </p>
          )}
          {pr.description && (
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{pr.description}</p>
          )}
        </div>
      </div>
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
