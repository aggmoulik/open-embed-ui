import { GitPullRequest } from 'lucide-react';
import { PRCard } from './pr-card';
import type { Contribution } from '@/types';

interface HighlightLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function HighlightLayout({ contributions, titleOverrides }: HighlightLayoutProps) {
  if (contributions.length === 0) return <EmptyState />;

  const featured = contributions[0];
  const displayTitle = titleOverrides?.[featured.id] || featured.title;
  const avatarUrl = `https://github.com/${featured.repoOwner}.png?size=64`;

  return (
    <div className="space-y-3">
      <div className="flex gap-4 rounded-xl border border-l-4 border-l-purple-500 bg-card p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
          <GitPullRequest className="size-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={featured.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold hover:underline"
          >
            {displayTitle}
          </a>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
            <a
              href={`https://github.com/${featured.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-medium hover:underline"
            >
              <img src={avatarUrl} alt={featured.repoOwner} className="size-5 rounded-full" loading="lazy" />
              {featured.repo}
            </a>
            <span className="text-green-600">+{featured.additions}</span>
            <span className="text-red-600">-{featured.deletions}</span>
            <span>{featured.changedFiles} files</span>
          </div>
          {featured.mergedAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              Merged on{' '}
              <time dateTime={new Date(featured.mergedAt).toISOString()}>
                {new Date(featured.mergedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </p>
          )}
        </div>
      </div>
      {contributions.length > 1 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {contributions.slice(1, 3).map((c) => (
            <PRCard key={c.id} contribution={c} titleOverride={titleOverrides?.[c.id]} />
          ))}
        </div>
      )}
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
