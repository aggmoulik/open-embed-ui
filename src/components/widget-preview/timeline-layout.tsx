import { GitPullRequest } from 'lucide-react';
import type { Contribution } from '@/types';

interface TimelineLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function TimelineLayout({ contributions, titleOverrides }: TimelineLayoutProps) {
  if (contributions.length === 0) return <EmptyState />;

  return (
    <div className="relative space-y-0">
      <div className="absolute top-0 bottom-0 left-4 w-px bg-border" />
      {contributions.map((c) => {
        const displayTitle = titleOverrides?.[c.id] || c.title;
        const avatarUrl = `https://github.com/${c.repoOwner}.png?size=32`;
        return (
          <div key={c.id} className="relative flex gap-4 py-3 pl-1">
            <div className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border bg-card">
              <GitPullRequest className="size-3.5 text-purple-500" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="line-clamp-1 text-sm font-medium hover:underline"
              >
                {displayTitle}
              </a>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                <a
                  href={`https://github.com/${c.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline"
                >
                  <img src={avatarUrl} alt={c.repoOwner} className="size-4 rounded-full" loading="lazy" />
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
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
      No contributions match these filters.
    </div>
  );
}
