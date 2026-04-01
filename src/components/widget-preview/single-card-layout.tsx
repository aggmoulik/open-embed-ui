import { GitPullRequest } from 'lucide-react';
import type { Contribution } from '@/types';

interface SingleCardLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function SingleCardLayout({ contributions, titleOverrides }: SingleCardLayoutProps) {
  const pr = contributions[0];
  if (!pr) return <EmptyState />;

  const displayTitle = titleOverrides?.[pr.id] || pr.title;
  const avatarUrl = `https://github.com/${pr.repoOwner}.png?size=64`;

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
          <GitPullRequest className="size-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold hover:underline"
          >
            {displayTitle}
          </a>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
            <a
              href={`https://github.com/${pr.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-medium hover:underline"
            >
              <img src={avatarUrl} alt={pr.repoOwner} className="size-5 rounded-full" loading="lazy" />
              {pr.repo}
            </a>
            <span className="text-green-600">+{pr.additions}</span>
            <span className="text-red-600">-{pr.deletions}</span>
            <span>{pr.changedFiles} files</span>
          </div>
          {pr.mergedAt && (
            <p className="mt-1 text-xs text-muted-foreground">
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
        </div>
      </div>
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
