'use client';

import { lazy, Suspense, type CSSProperties } from 'react';
import type { Contribution, WidgetConfig, WidgetLayout } from '@/types';
import { resolveThemeTokens } from '@open-embed-ui/widget-components';
import { useDashboardDarkMode } from '@/lib/use-dashboard-dark-mode';

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
  /** Override the dashboard's dark-mode detection. Lets the theme editor
   *  drive the preview independently of the dashboard chrome's mode. */
  previewMode?: 'light' | 'dark';
}

export function WidgetRenderer({ contributions, config, previewMode }: WidgetRendererProps) {
  const dashboardDark = useDashboardDarkMode();
  const isDark = previewMode ? previewMode === 'dark' : dashboardDark;
  const { light, dark } = resolveThemeTokens(config.preset, config.themeOverrides);
  const tokens = isDark ? dark : light;

  const requested = config.layout ?? 'grid';
  const resolved: WidgetLayout = layouts[requested as WidgetLayout]
    ? (requested as WidgetLayout)
    : (LEGACY_LAYOUT_FALLBACK[requested as string] ?? 'grid');
  const titleOverrides = config.titleOverrides;
  const Layout = layouts[resolved] ?? layouts.grid;

  // The dashboard uses Tailwind v4's `@theme inline { --color-background:
  // var(--background); ... }`, which compiles `bg-background` to
  // `background-color: var(--background)` at build time. So setting
  // `--color-background` on the wrapper alone has no effect on dashboard-
  // compiled utilities. Emit both prefixed (for widget.css direct readers
  // and any future raw CSS) AND unprefixed (for the Tailwind utilities the
  // imported widget-components compile against here).
  const previewStyle = buildPreviewStyle(tokens);

  return (
    <div className={`geu-widget${isDark ? 'dark' : ''}`} style={previewStyle}>
      <Suspense
        fallback={
          <div className="text-muted-foreground py-12 text-center text-sm">Loading layout...</div>
        }
      >
        <Layout contributions={contributions} titleOverrides={titleOverrides} />
      </Suspense>
    </div>
  );
}

function buildPreviewStyle(tokens: Record<string, string>): CSSProperties {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(tokens)) {
    out[k] = v;
    // Strip the `--color-` prefix and emit an unprefixed alias. e.g.
    // `--color-background` → `--background`, `--color-brand` → `--brand`.
    if (k.startsWith('--color-')) {
      out[`--${k.slice('--color-'.length)}`] = v;
    }
  }
  return out as CSSProperties;
}
