import { useState, useEffect } from 'preact/hooks';
import type { ComponentType } from 'preact';
import type { WidgetData, WidgetOptions, WidgetLayout, Contribution } from './types';

interface WidgetProps {
  options: WidgetOptions;
}

interface LayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

const layoutImports: Record<WidgetLayout, () => Promise<{ [key: string]: ComponentType<LayoutProps> }>> = {
  grid: () => import('./layouts/GridLayout'),
  list: () => import('./layouts/ListLayout'),
  timeline: () => import('./layouts/TimelineLayout'),
  'single-card': () => import('./layouts/SingleCardLayout'),
  marquee: () => import('./layouts/MarqueeLayout'),
  carousel: () => import('./layouts/CarouselLayout'),
  masonry: () => import('./layouts/MasonryLayout'),
  highlight: () => import('./layouts/HighlightLayout'),
};

const layoutExportNames: Record<WidgetLayout, string> = {
  grid: 'GridLayout',
  list: 'ListLayout',
  timeline: 'TimelineLayout',
  'single-card': 'SingleCardLayout',
  marquee: 'MarqueeLayout',
  carousel: 'CarouselLayout',
  masonry: 'MasonryLayout',
  highlight: 'HighlightLayout',
};

export function Widget({ options }: WidgetProps) {
  const [data, setData] = useState<WidgetData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [LayoutComponent, setLayoutComponent] = useState<ComponentType<LayoutProps> | null>(null);

  const baseUrl = options.baseUrl || '';

  useEffect(() => {
    fetch(`${baseUrl}/api/embed/${options.widgetId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load widget (${res.status})`);
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [options.widgetId, baseUrl]);

  useEffect(() => {
    if (!data) return;
    const layout: WidgetLayout = data.widget.config.layout ?? 'grid';
    layoutImports[layout]().then((mod) => {
      const name = layoutExportNames[layout];
      setLayoutComponent(() => mod[name] as ComponentType<LayoutProps>);
    });
  }, [data]);

  if (loading) return <div class="geu-loading">Loading...</div>;
  if (error) return <div class="geu-error">{error}</div>;
  if (!data || !LayoutComponent) return null;

  const titleOverrides = data.widget.config.titleOverrides;
  const contributions = data.contributions;

  return (
    <div>
      <LayoutComponent contributions={contributions} titleOverrides={titleOverrides} />
      <a
        href={baseUrl || 'https://github.com/moulikaggarwal/github-embed-ui'}
        target="_blank"
        rel="noopener noreferrer"
        class="geu-footer"
      >
        Powered by GitHub Embed UI
      </a>
    </div>
  );
}
