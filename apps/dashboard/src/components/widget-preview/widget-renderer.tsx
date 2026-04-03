import { lazy, Suspense } from 'react';
import type { Contribution, WidgetConfig, WidgetLayout } from '@/types';

const GridLayout = lazy(() => import('./grid-layout').then((m) => ({ default: m.GridLayout })));
const ListLayout = lazy(() => import('./list-layout').then((m) => ({ default: m.ListLayout })));
const TimelineLayout = lazy(() => import('./timeline-layout').then((m) => ({ default: m.TimelineLayout })));
const SingleCardLayout = lazy(() => import('./single-card-layout').then((m) => ({ default: m.SingleCardLayout })));
const MarqueeLayout = lazy(() => import('./marquee-layout').then((m) => ({ default: m.MarqueeLayout })));
const CarouselLayout = lazy(() => import('./carousel-layout').then((m) => ({ default: m.CarouselLayout })));
const MasonryLayout = lazy(() => import('./masonry-layout').then((m) => ({ default: m.MasonryLayout })));
const HighlightLayout = lazy(() => import('./highlight-layout').then((m) => ({ default: m.HighlightLayout })));

const layouts: Record<WidgetLayout, React.LazyExoticComponent<React.ComponentType<LayoutProps>>> = {
  grid: GridLayout,
  list: ListLayout,
  timeline: TimelineLayout,
  'single-card': SingleCardLayout,
  marquee: MarqueeLayout,
  carousel: CarouselLayout,
  masonry: MasonryLayout,
  highlight: HighlightLayout,
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
    <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading layout...</div>}>
      <Layout contributions={contributions} titleOverrides={titleOverrides} />
    </Suspense>
  );
}
