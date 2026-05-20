import { useState, useEffect } from 'preact/hooks';
import type { ComponentType } from 'preact';
import type { WidgetData, WidgetOptions, WidgetLayout, Contribution } from './types';
import { safeHref } from './lib/url-safe';
import type { LayoutResolver, LayoutProps } from './layout-map';

interface WidgetProps {
  options: WidgetOptions;
  /**
   * Pre-loaded layout component for per-layout IIFE bundles. When present,
   * `layoutResolver` is ignored and the component is used directly.
   */
  LayoutComponent?: ComponentType<LayoutProps>;
  /**
   * Dynamic-import resolver for the all-layouts bundle. Only provided by
   * the all-layouts entry (src/index.ts); per-layout entries omit it.
   */
  layoutResolver?: LayoutResolver;
  /**
   * Legacy layout string fallback map (carousel → grid, log → gitlog, etc.).
   * Provided by the all-layouts entry alongside layoutResolver.
   */
  legacyFallback?: Record<string, WidgetLayout>;
}

type ErrorKind = 'blocked' | 'not-found' | 'unavailable' | 'config';

export function Widget({ options, LayoutComponent: injectedLayout, layoutResolver, legacyFallback }: WidgetProps) {
  const [data, setData] = useState<WidgetData | null>(null);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedLayout, setResolvedLayout] = useState<ComponentType<LayoutProps> | null>(
    injectedLayout ?? null,
  );

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
            '[Open Embed UI] This domain is not on the widget\'s allowlist. ' +
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
          console.warn('[Open Embed UI] Fetch failed — likely a CORS or network error.', err);
          setErrorKind('unavailable');
        }
      })
      .finally(() => setLoading(false));
  }, [options.widgetId, options.dataSrc, baseUrl]);

  useEffect(() => {
    if (!data) return;
    // When a per-layout bundle injects the component directly, skip the
    // dynamic-import resolver entirely — the layout is already bundled.
    if (injectedLayout) {
      setResolvedLayout(() => injectedLayout);
      return;
    }
    if (!layoutResolver) return;
    // Tolerate legacy / unknown layout strings (e.g. widgets stored with
    // `carousel` or `log` after those layouts were dropped) by mapping to
    // the closest sibling, falling back to grid.
    const requested = (data.widget.config.layout ?? 'grid') as string;
    // If it's in the legacy map, remap; otherwise pass through as-is (the
    // resolver will handle unknown strings by falling back to grid).
    const layout = ((legacyFallback ?? {})[requested] ?? requested) as WidgetLayout;
    layoutResolver(layout).then((Component) => {
      setResolvedLayout(() => Component);
    });
  }, [data, injectedLayout, layoutResolver, legacyFallback]);

  if (loading) return <div class="geu-loading">Loading...</div>;
  if (errorKind) return <ErrorPlaceholder kind={errorKind} />;
  if (!data || !resolvedLayout) return null;

  const LayoutComponent = resolvedLayout;
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
        Powered by Open Embed UI
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
