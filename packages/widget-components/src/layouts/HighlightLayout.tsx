'use client';

import { useState } from 'react';
import { BookOpen, GitPullRequest } from '../icons';
import {
  getBlogTarget,
  getDisplayLabels,
  getLabelColor,
  safeHref,
  safeImgSrc,
} from '@open-embed-ui/types';
import { PRCard } from '../PRCard';
import type { BaseContribution as Contribution } from '@open-embed-ui/types';

interface HighlightLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

function shortDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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
  const blog = getBlogTarget(contribution);
  // Hero card: render auto-detected labels when the user hasn't set any —
  // falls back to ['MERGED'] so the label slot never collapses.
  const labels = getDisplayLabels(displayTitle, contribution.labels);

  return (
    <div className="border-border bg-background border-l-brand overflow-hidden rounded-xl border border-l-4">
      <div className="border-border bg-muted/30 flex items-center justify-between border-b border-dashed px-4 py-2">
        <span className="text-brand font-mono text-[10px] tracking-[0.08em] uppercase">
          // featured
        </span>
        {contribution.mergedAt && (
          <time
            className="text-muted-foreground/80 font-mono text-[10px] tracking-[0.08em] uppercase"
            dateTime={new Date(contribution.mergedAt).toISOString()}
          >
            merged {shortDate(contribution.mergedAt)}
          </time>
        )}
      </div>

      <div className="flex gap-4 p-5">
        <div className="bg-violet/10 text-violet flex size-10 shrink-0 items-center justify-center rounded-full">
          <GitPullRequest className="size-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          {labels.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {labels.map((label) => {
                const color = getLabelColor(label);
                return (
                  <span
                    key={label}
                    className="rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.06em] text-white uppercase"
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
              href={safeHref(contribution.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-sans text-[16px] leading-[1.3] font-semibold tracking-[-0.015em] underline-offset-2 hover:underline"
            >
              {displayTitle}
            </a>
            {blog && (
              <a
                href={safeHref(blog.href)}
                target={blog.target}
                rel={blog.rel}
                className="text-muted-foreground/70 hover:text-foreground mt-1 shrink-0 transition-colors"
                aria-label="Read blog post"
                title="Read blog post"
              >
                <BookOpen className="size-4" strokeWidth={1.75} />
              </a>
            )}
          </div>

          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[12px]">
            <a
              href={safeHref(`https://github.com/${contribution.repo}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <img
                src={safeImgSrc(avatarUrl)}
                alt={contribution.repoOwner}
                className="size-4 rounded-full"
                loading="lazy"
              />
              {contribution.repo}
            </a>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-brand">+{contribution.additions}</span>
            <span className="text-danger">−{contribution.deletions}</span>
            <span className="text-muted-foreground/40">·</span>
            <span>{contribution.changedFiles} files</span>
          </div>

          {contribution.description && (
            <p className="text-muted-foreground mt-2.5 line-clamp-2 text-[13px] leading-[1.55]">
              {contribution.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

type TabId = 'featured' | 'featured-grid';

const TABS: { id: TabId; label: string; hint: string }[] = [
  { id: 'featured-grid', label: '1 + grid', hint: 'hero + supporting' },
  { id: 'featured', label: 'all featured', hint: 'every PR as a feature card' },
];

export function HighlightLayout({ contributions, titleOverrides }: HighlightLayoutProps) {
  const [tab, setTab] = useState<TabId>('featured-grid');

  if (contributions.length === 0) return <EmptyState />;

  if (contributions.length === 1) {
    return (
      <div className="space-y-3">
        <FeaturedCard
          contribution={contributions[0]}
          titleOverride={titleOverrides?.[contributions[0].id]}
        />
      </div>
    );
  }

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <div className="space-y-3.5">
      {/* Custom tabs matching the new aesthetic — replaces shadcn Tabs */}
      <div className="border-border bg-muted/30 inline-flex items-center gap-0.5 rounded-md border p-0.5">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              title={t.hint}
              className={`h-7 rounded-[5px] px-3 font-mono text-[11px] transition-colors ${
                active
                  ? 'bg-background text-foreground shadow-[0_1px_2px_rgba(0,0,0,.06)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          );
        })}
        <span className="text-muted-foreground/60 mr-1 ml-2 font-mono text-[10px] tracking-[0.08em] uppercase">
          {activeTab.hint}
        </span>
      </div>

      {tab === 'featured' && (
        <div className="space-y-3.5">
          {contributions.map((c) => (
            <FeaturedCard key={c.id} contribution={c} titleOverride={titleOverrides?.[c.id]} />
          ))}
        </div>
      )}

      {tab === 'featured-grid' && (
        <div className="space-y-3.5">
          <FeaturedCard
            contribution={contributions[0]}
            titleOverride={titleOverrides?.[contributions[0].id]}
          />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {contributions.slice(1).map((c) => (
              <PRCard key={c.id} contribution={c} titleOverride={titleOverrides?.[c.id]} uniform />
            ))}
          </div>
        </div>
      )}
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
