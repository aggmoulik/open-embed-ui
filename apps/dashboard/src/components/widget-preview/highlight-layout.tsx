'use client';

import { GitPullRequest } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@github-embed-ui/ui/components/tabs';
import { PRCard } from './pr-card';
import type { Contribution } from '@/types';
import { safeHref, safeImgSrc } from '@/lib/validation/contribution';

interface HighlightLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

function FeaturedCard({
  contribution,
  titleOverride,
}: {
  contribution: Contribution;
  titleOverride?: string;
}) {
  const displayTitle = contribution.titleOverride || titleOverride || contribution.title;
  const avatarUrl = `https://github.com/${contribution.repoOwner}.png?size=64`;

  return (
    <div className="bg-card flex gap-4 rounded-xl border border-l-4 border-l-purple-500 p-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
        <GitPullRequest className="size-5 text-purple-600 dark:text-purple-400" />
      </div>
      <div className="min-w-0 flex-1">
        <a
          href={safeHref(contribution.url)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-semibold hover:underline"
        >
          {displayTitle}
        </a>
        <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 text-sm">
          <a
            href={safeHref(`https://github.com/${contribution.repo}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-medium hover:underline"
          >
            <img
              src={safeImgSrc(avatarUrl)}
              alt={contribution.repoOwner}
              className="size-5 rounded-full"
              loading="lazy"
            />
            {contribution.repo}
          </a>
          <span className="text-green-600">+{contribution.additions}</span>
          <span className="text-red-600">-{contribution.deletions}</span>
          <span>{contribution.changedFiles} files</span>
        </div>
        {contribution.mergedAt && (
          <p className="text-muted-foreground mt-1 text-xs">
            Merged on{' '}
            <time dateTime={new Date(contribution.mergedAt).toISOString()}>
              {new Date(contribution.mergedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </p>
        )}
      </div>
    </div>
  );
}

export function HighlightLayout({ contributions, titleOverrides }: HighlightLayoutProps) {
  if (contributions.length === 0) return <EmptyState />;

  const hasMultiple = contributions.length > 1;

  if (!hasMultiple) {
    return (
      <div className="space-y-3">
        <FeaturedCard
          contribution={contributions[0]}
          titleOverride={titleOverrides?.[contributions[0].id]}
        />
      </div>
    );
  }

  return (
    <Tabs defaultValue="featured-grid">
      <TabsList>
        <TabsTrigger value="featured">All Featured</TabsTrigger>
        <TabsTrigger value="featured-grid">1 + Grid</TabsTrigger>
      </TabsList>

      <TabsContent value="featured">
        <div className="space-y-3">
          {contributions.map((c) => (
            <FeaturedCard key={c.id} contribution={c} titleOverride={titleOverrides?.[c.id]} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="featured-grid">
        <div className="space-y-3">
          <FeaturedCard
            contribution={contributions[0]}
            titleOverride={titleOverrides?.[contributions[0].id]}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {contributions.slice(1).map((c) => (
              <PRCard key={c.id} contribution={c} titleOverride={titleOverrides?.[c.id]} />
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function EmptyState() {
  return (
    <div className="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm">
      No contributions match these filters.
    </div>
  );
}
