import { useState, useEffect } from 'preact/hooks';
import { GridLayout } from './layouts/GridLayout';
import { ListLayout } from './layouts/ListLayout';
import { TimelineLayout } from './layouts/TimelineLayout';
import { SingleCardLayout } from './layouts/SingleCardLayout';
import type { WidgetData, WidgetOptions } from './types';

interface WidgetProps {
  options: WidgetOptions;
}

export function Widget({ options }: WidgetProps) {
  const [data, setData] = useState<WidgetData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div class="geu-loading">Loading...</div>;
  if (error) return <div class="geu-error">{error}</div>;
  if (!data) return null;

  const config = data.widget.config;
  const layout = config.layout ?? 'grid';
  const titleOverrides = config.titleOverrides;
  const contributions = data.contributions;

  const LayoutComponent =
    layout === 'list' ? ListLayout
    : layout === 'timeline' ? TimelineLayout
    : layout === 'single-card' ? SingleCardLayout
    : GridLayout;

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
