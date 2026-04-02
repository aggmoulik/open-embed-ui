'use client';

import { Card, CardContent } from '@github-embed-ui/ui/components/card';
import { Badge } from '@github-embed-ui/ui/components/badge';
import { GitPullRequest } from 'lucide-react';
import type { Contribution } from '@/types';

interface ContributionCardProps {
  contribution: Contribution;
}

export function ContributionCard({ contribution }: ContributionCardProps) {
  return (
    <Card className="transition-colors hover:bg-muted/50">
      <CardContent className="flex gap-3 p-4">
        <div className="mt-0.5 flex-shrink-0">
          <GitPullRequest className="size-5 text-purple-500" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <a
              href={contribution.url}
              target="_blank"
              rel="noopener noreferrer"
              className="line-clamp-1 text-sm font-medium hover:underline"
            >
              {contribution.title}
            </a>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
            >
              Merged
            </Badge>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <a
              href={`https://github.com/${contribution.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
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
        </div>
      </CardContent>
    </Card>
  );
}
