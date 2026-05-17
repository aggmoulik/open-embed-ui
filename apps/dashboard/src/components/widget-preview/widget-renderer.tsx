import { lazy, Suspense } from 'react';
import type { Contribution, WidgetConfig, WidgetLayout } from '@/types';

const GridLayout = lazy(() => import('./grid-layout').then((m) => ({ default: m.GridLayout })));
const ListLayout = lazy(() => import('./list-layout').then((m) => ({ default: m.ListLayout })));
const TimelineLayout = lazy(() =>
  import('./timeline-layout').then((m) => ({ default: m.TimelineLayout })),
);
const SingleCardLayout = lazy(() =>
  import('./single-card-layout').then((m) => ({ default: m.SingleCardLayout })),
);
const MarqueeLayout = lazy(() =>
  import('./marquee-layout').then((m) => ({ default: m.MarqueeLayout })),
);
const MasonryLayout = lazy(() =>
  import('./masonry-layout').then((m) => ({ default: m.MasonryLayout })),
);
const HighlightLayout = lazy(() =>
  import('./highlight-layout').then((m) => ({ default: m.HighlightLayout })),
);
const TerminalLayout = lazy(() =>
  import('./terminal-layout').then((m) => ({ default: m.TerminalLayout })),
);
const ScorecardLayout = lazy(() =>
  import('./scorecard-layout').then((m) => ({ default: m.ScorecardLayout })),
);
const GitlogLayout = lazy(() =>
  import('./gitlog-layout').then((m) => ({ default: m.GitlogLayout })),
);
const DevlogLayout = lazy(() =>
  import('./devlog-layout').then((m) => ({ default: m.DevlogLayout })),
);
const ProofLayout = lazy(() => import('./proof-layout').then((m) => ({ default: m.ProofLayout })));

const layouts: Record<WidgetLayout, React.LazyExoticComponent<React.ComponentType<LayoutProps>>> = {
  grid: GridLayout,
  list: ListLayout,
  timeline: TimelineLayout,
  'single-card': SingleCardLayout,
  marquee: MarqueeLayout,
  masonry: MasonryLayout,
  highlight: HighlightLayout,
  terminal: TerminalLayout,
  scorecard: ScorecardLayout,
  gitlog: GitlogLayout,
  devlog: DevlogLayout,
  proof: ProofLayout,
};

// Layouts that have been dropped: explicit fallbacks keep stored widgets
// rendering something sensible without a data migration.
//   carousel (feature 17) → grid     (handled by the `?? layouts.grid` below)
//   log      (feature 17) → gitlog   (gitlog now carries log's stats too)
const LEGACY_LAYOUT_FALLBACK: Record<string, WidgetLayout> = {
  log: 'gitlog',
};

interface LayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

interface WidgetRendererProps {
  contributions: Contribution[];
  config: WidgetConfig;
}

export function WidgetRenderer({ contributions, config }: WidgetRendererProps) {
  const requested = config.layout ?? 'grid';
  const resolved: WidgetLayout = layouts[requested as WidgetLayout]
    ? (requested as WidgetLayout)
    : (LEGACY_LAYOUT_FALLBACK[requested as string] ?? 'grid');
  const titleOverrides = config.titleOverrides;
  const Layout = layouts[resolved] ?? layouts.grid;

  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground py-12 text-center text-sm">Loading layout...</div>
      }
    >
      <Layout contributions={contributions} titleOverrides={titleOverrides} />
    </Suspense>
  );
}
