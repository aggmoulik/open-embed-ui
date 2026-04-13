import { GitPullRequest } from 'lucide-react';
import type { Contribution } from '@/types';

interface PRCardProps {
  contribution: Contribution;
  compact?: boolean;
  titleOverride?: string;
  showDescription?: boolean;
}

export function PRCard({ contribution, compact, titleOverride, showDescription }: PRCardProps) {
  const displayTitle = contribution.titleOverride || titleOverride || contribution.title;
  const avatarUrl = `https://github.com/${contribution.repoOwner}.png?size=32`;

  return (
    <div className="border-border bg-card hover:bg-muted/50 rounded-lg border p-3 transition-colors">
      <div className="flex gap-2.5">
        <GitPullRequest className="mt-0.5 size-4 shrink-0 text-purple-500" />
        <div className="min-w-0 flex-1">
          <a
            href={contribution.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-medium hover:underline ${compact ? 'text-xs' : 'text-sm'} line-clamp-1`}
          >
            {displayTitle}
          </a>
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            <a
              href={`https://github.com/${contribution.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline"
            >
              <img
                src={avatarUrl}
                alt={contribution.repoOwner}
                className="size-4 rounded-full"
                loading="lazy"
              />
              {contribution.repo}
            </a>
            <span className="text-green-600">+{contribution.additions}</span>
            <span className="text-red-600">-{contribution.deletions}</span>
            {contribution.mergedAt && (
              <time dateTime={new Date(contribution.mergedAt).toISOString()}>
                {new Date(contribution.mergedAt).toLocaleDateString()}
              </time>
            )}
          </div>
          {showDescription && (
            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
              {contribution.changedFiles} files changed across {contribution.repo.split('/')[1]}{' '}
              with {contribution.additions + contribution.deletions} total line modifications.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
