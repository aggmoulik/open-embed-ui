import { WidgetRenderer } from '@/components/widget-preview/widget-renderer';
import type { Contribution } from '@/types';

const DEMO_CONTRIBUTIONS: Contribution[] = [
  {
    id: 'demo-1',
    githubId: 'demo-1',
    title: 'feat(widget): add masonry layout with Shadow DOM isolation',
    url: 'https://github.com/aggmoulik/github-embed-ui/pull/142',
    repo: 'aggmoulik/github-embed-ui',
    repoOwner: 'aggmoulik',
    repoName: 'github-embed-ui',
    mergedAt: new Date('2026-05-12T14:32:00Z'),
    additions: 287,
    deletions: 14,
    changedFiles: 6,
    description:
      'Pinterest-style staggered grid with full CSS isolation. Container queries handle responsive breakpoints without JS measurement.',
    blogUrl: 'https://example.com/posts/masonry-layout',
    labels: ['FEATURE'],
    createdAt: new Date('2026-05-10T09:00:00Z'),
    updatedAt: new Date('2026-05-12T14:32:00Z'),
  },
  {
    id: 'demo-2',
    githubId: 'demo-2',
    title: 'fix(embed): enforce per-widget origin allowlist on hot path',
    url: 'https://github.com/aggmoulik/github-embed-ui/pull/138',
    repo: 'aggmoulik/github-embed-ui',
    repoOwner: 'aggmoulik',
    repoName: 'github-embed-ui',
    mergedAt: new Date('2026-05-08T11:18:00Z'),
    additions: 94,
    deletions: 23,
    changedFiles: 4,
    description:
      'Default-deny check moved before any DB work — closes the trivial enumeration vector.',
    labels: ['SECURITY'],
    createdAt: new Date('2026-05-07T16:00:00Z'),
    updatedAt: new Date('2026-05-08T11:18:00Z'),
  },
  {
    id: 'demo-3',
    githubId: 'demo-3',
    title: 'perf(widget): shave 4 KB off gzipped bundle with tree-shaking pass',
    url: 'https://github.com/aggmoulik/github-embed-ui/pull/131',
    repo: 'aggmoulik/github-embed-ui',
    repoOwner: 'aggmoulik',
    repoName: 'github-embed-ui',
    mergedAt: new Date('2026-05-01T20:45:00Z'),
    additions: 31,
    deletions: 72,
    changedFiles: 3,
    description:
      'Replaced two unused tree-shake-defeating barrel exports. Widget.js drops to 15 KB gz.',
    blogUrl: 'https://example.com/posts/bundle-budget',
    labels: ['PERFORMANCE'],
    createdAt: new Date('2026-04-29T10:00:00Z'),
    updatedAt: new Date('2026-05-01T20:45:00Z'),
  },
];

export function WidgetDemo() {
  return (
    <section id="demo" className="bg-muted/30 border-y py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">See it in action</h2>
          <p className="text-muted-foreground mt-3 text-base">
            This is the actual widget renderer — same React component, same data shape.
          </p>
        </div>

        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
          <div className="bg-muted/50 flex items-center gap-1.5 border-b px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-red-400/70" aria-hidden="true" />
            <span className="size-2.5 rounded-full bg-yellow-400/70" aria-hidden="true" />
            <span className="size-2.5 rounded-full bg-green-400/70" aria-hidden="true" />
            <span className="text-muted-foreground ml-2 truncate text-xs">your-portfolio.dev</span>
          </div>
          <div className="p-6 sm:p-8">
            <WidgetRenderer
              contributions={DEMO_CONTRIBUTIONS}
              config={{ layout: 'grid', theme: 'system' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
