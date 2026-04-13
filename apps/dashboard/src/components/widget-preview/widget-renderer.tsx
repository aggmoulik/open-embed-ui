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
const CarouselLayout = lazy(() =>
  import('./carousel-layout').then((m) => ({ default: m.CarouselLayout })),
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
const LogLayout = lazy(() => import('./log-layout').then((m) => ({ default: m.LogLayout })));
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
  carousel: CarouselLayout,
  masonry: MasonryLayout,
  highlight: HighlightLayout,
  terminal: TerminalLayout,
  log: LogLayout,
  scorecard: ScorecardLayout,
  gitlog: GitlogLayout,
  devlog: DevlogLayout,
  proof: ProofLayout,
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
  const layout: WidgetLayout = config.layout ?? 'grid';
  const titleOverrides = config.titleOverrides;
  const Layout = layouts[layout] ?? layouts.grid;

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
