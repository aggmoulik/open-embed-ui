import { useState, useEffect } from 'preact/hooks';
import type { ComponentType } from 'preact';
import type { WidgetData, WidgetOptions, WidgetLayout, Contribution } from './types';
import { safeHref } from './lib/url-safe';

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
  terminal: () => import('./layouts/TerminalLayout'),
  log: () => import('./layouts/LogLayout'),
  scorecard: () => import('./layouts/ScorecardLayout'),
  gitlog: () => import('./layouts/GitlogLayout'),
  devlog: () => import('./layouts/DevlogLayout'),
  proof: () => import('./layouts/ProofLayout'),
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
  terminal: 'TerminalLayout',
  log: 'LogLayout',
  scorecard: 'ScorecardLayout',
  gitlog: 'GitlogLayout',
  devlog: 'DevlogLayout',
  proof: 'ProofLayout',
};

type ErrorKind = 'blocked' | 'not-found' | 'unavailable' | 'config';

export function Widget({ options }: WidgetProps) {
  const [data, setData] = useState<WidgetData | null>(null);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [LayoutComponent, setLayoutComponent] = useState<ComponentType<LayoutProps> | null>(null);

  const baseUrl = options.baseUrl || '';

  useEffect(() => {
    // Static mode: fetch from a pre-exported JSON file (no API needed).
    // API mode: fetch from `${baseUrl}/api/embed/${widgetId}`.
    const url = options.dataSrc
      ? options.dataSrc
      : options.widgetId
        ? `${baseUrl}/api/embed/${options.widgetId}`
        : null;

    if (!url) {
      setErrorKind('config');
      setLoading(false);
      return;
    }

    fetch(url)
      .then((res) => {
        if (res.status === 403) {
          // Origin not on the widget's allowlist. Log once for the dev;
          // user-facing text is deliberately neutral (no data leak).
          console.warn(
            '[GitHub Embed UI] This domain is not on the widget\'s allowlist. ' +
              'Ask the widget owner to add your domain in the dashboard.',
          );
          throw new WidgetError('blocked');
        }
        if (res.status === 404) throw new WidgetError('not-found');
        if (!res.ok) throw new WidgetError('unavailable');
        return res.json();
      })
      .then(setData)
      .catch((err) => {
        // CORS failures reject as TypeError before we can read the
        // status code — surface as "unavailable" with a console hint.
        if (err instanceof WidgetError) {
          setErrorKind(err.kind);
        } else {
          console.warn('[GitHub Embed UI] Fetch failed — likely a CORS or network error.', err);
          setErrorKind('unavailable');
        }
      })
      .finally(() => setLoading(false));
  }, [options.widgetId, options.dataSrc, baseUrl]);

  useEffect(() => {
    if (!data) return;
    const layout: WidgetLayout = data.widget.config.layout ?? 'grid';
    layoutImports[layout]().then((mod) => {
      const name = layoutExportNames[layout];
      setLayoutComponent(() => mod[name] as ComponentType<LayoutProps>);
    });
  }, [data]);

  if (loading) return <div class="geu-loading">Loading...</div>;
  if (errorKind) return <ErrorPlaceholder kind={errorKind} />;
  if (!data || !LayoutComponent) return null;

  const titleOverrides = data.widget.config.titleOverrides;
  const contributions = data.contributions;

  return (
    <div>
      <LayoutComponent contributions={contributions} titleOverrides={titleOverrides} />
      <a
        href={safeHref(baseUrl) === '#' ? 'https://github.com/moulikaggarwal/github-embed-ui' : baseUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="geu-footer"
      >
        Powered by GitHub Embed UI
      </a>
    </div>
  );
}

class WidgetError extends Error {
  constructor(public kind: ErrorKind) {
    super(kind);
  }
}

function ErrorPlaceholder({ kind }: { kind: ErrorKind }) {
  // Keep text minimal and neutral. No widget id, no owner info, no
  // hints that could help an attacker enumerate widgets.
  const messages: Record<ErrorKind, string> = {
    blocked: 'This widget is not available on this site.',
    'not-found': 'Widget not found.',
    unavailable: 'Widget unavailable.',
    config: 'Widget configuration error. Check the embed snippet.',
  };
  return (
    <div class={`geu-empty geu-empty-${kind}`} role="status" aria-live="polite">
      {messages[kind]}
    </div>
  );
}
