'use client';

import { Button } from '@open-embed-ui/ui/components/button';
import { Badge } from '@open-embed-ui/ui/components/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@open-embed-ui/ui/components/tooltip';
import { GitPullRequest, Pencil, ExternalLink, Link as LinkIcon } from 'lucide-react';
import type { Contribution } from '@/types';

interface ContributionRowProps {
  contribution: Contribution;
  onEdit: (contribution: Contribution) => void;
}

/**
 * Compact list row for the paginated My Contributions view. The existing
 * `contribution-card.tsx` is intentionally left untouched — it is used in
 * the widget builder preview elsewhere. This row is narrower, taller-count
 * friendly, and carries the "enriched" indicator + edit affordance.
 */
export function ContributionRow({ contribution, onEdit }: ContributionRowProps) {
  const { description, blogUrl, blogOpenInNewTab } = contribution;
  const hasDescription = Boolean(description && description.trim());
  const hasBlog = Boolean(blogUrl && blogUrl.trim());
  const enrichedCount = Number(hasDescription) + Number(hasBlog);

  // Default true: if the field is missing/undefined on older rows, open in
  // a new tab (the conservative safer default).
  const openInNewTab = blogOpenInNewTab !== false;

  return (
    <div className="group hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition-colors">
      <GitPullRequest className="mt-0.5 size-5 flex-shrink-0 text-purple-500" />

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

          <div className="flex flex-shrink-0 items-center gap-1.5">
            <EnrichedIndicator
              hasDescription={hasDescription}
              hasBlog={hasBlog}
              count={enrichedCount}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => onEdit(contribution)}
            >
              <Pencil className="size-3" />
              Edit
            </Button>
          </div>
        </div>

        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
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
          {hasBlog && blogUrl && (
            <a
              href={blogUrl}
              {...(openInNewTab
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : { rel: 'noopener' })}
              className="inline-flex items-center gap-0.5 hover:underline"
            >
              {openInNewTab ? (
                <ExternalLink className="size-3" />
              ) : (
                <LinkIcon className="size-3" />
              )}
              Blog
            </a>
          )}
        </div>

        {hasDescription && (
          <p className="text-foreground/80 mt-2 line-clamp-2 text-xs leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function EnrichedIndicator({
  hasDescription,
  hasBlog,
  count,
}: {
  hasDescription: boolean;
  hasBlog: boolean;
  count: number;
}) {
  if (count === 0) {
    return (
      <Badge variant="outline" className="text-muted-foreground h-5 px-1.5 text-[10px]">
        Empty
      </Badge>
    );
  }

  const parts = [
    hasDescription ? 'Description' : null,
    hasBlog ? 'Blog' : null,
  ].filter(Boolean);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-0.5">
            <Dot filled={hasDescription} />
            <Dot filled={hasBlog} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {count === 2 ? 'All details set' : `${parts.join(', ')} set`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function Dot({ filled }: { filled: boolean }) {
  return (
    <span
      className={
        filled
          ? 'size-1.5 rounded-full bg-purple-500'
          : 'size-1.5 rounded-full bg-muted-foreground/30'
      }
    />
  );
}
