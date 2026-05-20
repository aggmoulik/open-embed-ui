import { lazy, Suspense } from 'react';
import type { Contribution, WidgetConfig, WidgetLayout } from '@/types';

const GridLayout = lazy(() =>
  import('@open-embed-ui/widget-components').then((m) => ({ default: m.GridLayout })),
);
const ListLayout = lazy(() =>
  import('@open-embed-ui/widget-components').then((m) => ({ default: m.ListLayout })),
);
const TimelineLayout = lazy(() =>
  import('@open-embed-ui/widget-components').then((m) => ({ default: m.TimelineLayout })),
);
const SingleCardLayout = lazy(() =>
  import('@open-embed-ui/widget-components').then((m) => ({ default: m.SingleCardLayout })),
);
const MarqueeLayout = lazy(() =>
  import('@open-embed-ui/widget-components').then((m) => ({ default: m.MarqueeLayout })),
);
const MasonryLayout = lazy(() =>
  import('@open-embed-ui/widget-components').then((m) => ({ default: m.MasonryLayout })),
);
const HighlightLayout = lazy(() =>
  import('@open-embed-ui/widget-components').then((m) => ({ default: m.HighlightLayout })),
);

const layouts: Record<WidgetLayout, React.LazyExoticComponent<React.ComponentType<LayoutProps>>> = {
  grid: GridLayout,
  list: ListLayout,
  timeline: TimelineLayout,
  'single-card': SingleCardLayout,
  marquee: MarqueeLayout,
  masonry: MasonryLayout,
  highlight: HighlightLayout,
};

// Layouts that have been dropped: explicit fallbacks keep stored widgets
// rendering something sensible without a data migration.
//   carousel (feature 17) → grid     (handled by the `?? layouts.grid` below)
//   log      → list     (receipt-family removed; log was chronological)
const LEGACY_LAYOUT_FALLBACK: Record<string, WidgetLayout> = {
  log: 'list',
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
