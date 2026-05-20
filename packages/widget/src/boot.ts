/**
 * Shared DOM boot utilities. This module is imported by BOTH:
 *   - src/index.ts (all-layouts IIFE + ESM)
 *   - src/entries/*.ts (per-layout IIFEs)
 *
 * It intentionally does NOT import layout-map.ts so that per-layout bundles
 * never pull in the full 12-layout dynamic-import map.
 */
import { render, h } from 'preact';
import type { ComponentType } from 'preact';
import { Widget } from './Widget';
import type { WidgetOptions, WidgetLayout } from './types';
import type { LayoutProps, LayoutResolver } from './layout-map';
// Vite's ?inline query gives the processed CSS as a string (declared in
// ./vite-env.d.ts), which we inject into the Shadow DOM below.
import cssText from './styles/widget.css?inline';

export function createShadowDOM(host: HTMLElement) {
  const shadowRoot = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = typeof cssText === 'string' ? cssText : '';
  shadowRoot.appendChild(style);

  const container = document.createElement('div');
  container.id = 'geu-root';
  shadowRoot.appendChild(container);

  return { shadowRoot, container };
}

export function renderWidget(
  container: HTMLElement,
  options: WidgetOptions,
  layoutComponent?: ComponentType<LayoutProps>,
  layoutResolverFn?: LayoutResolver,
  legacyFallback?: Record<string, WidgetLayout>,
) {
  const wrapper = document.createElement('div');
  wrapper.className = 'geu-widget';
  container.appendChild(wrapper);

  const applyTheme = () => {
    wrapper.classList.toggle('dark', resolveTheme(options.theme) === 'dark');
  };

  applyTheme();
  render(
    h(Widget, {
      options,
      ...(layoutComponent
        ? { LayoutComponent: layoutComponent }
        : { layoutResolver: layoutResolverFn, legacyFallback }),
    }),
    wrapper,
  );

  if (options.theme !== 'dark' && options.theme !== 'light') {
    observeTheme(applyTheme);
  }

  window.addEventListener('message', (e) => {
    if (e.data?.type === 'geu-theme') {
      if (e.data.theme === 'dark') wrapper.classList.add('dark');
      else if (e.data.theme === 'light') wrapper.classList.remove('dark');
      else applyTheme();
    }
  });
}

export function findOurScript(): HTMLScriptElement | null {
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    'script[data-widget-id]:not([data-geu-init]), script[data-src]:not([data-geu-init])',
  );
  return scripts[scripts.length - 1] ?? null;
}

/**
 * Scan <script> tags for the widget's own boot script (matching srcRegex),
 * extract config from data-* attributes, create/locate the host element, and
 * read the theme attribute. Returns null if no matching script tag is found,
 * if required attributes are missing, or if the target is already mounted.
 *
 * Used by both autoInit (all-layouts bundle) and doInit (per-layout bundles)
 * to avoid duplicating the script-scanning + mount-prep logic.
 *
 * @param srcRegex - Regex used to strip the script filename from src to derive
 *   baseUrl. Passed as a parameter so index.ts can use /widget\.js$/ while
 *   per-layout entries use /widget-[a-z-]+\.js$/.
 */
export function readScriptTagAndPrepareHost(srcRegex: RegExp): {
  host: HTMLElement;
  widgetId: string | null;
  dataSrc: string | null;
  baseUrl: string | undefined;
  theme: 'light' | 'dark' | 'system';
} | null {
  const candidate = (document.currentScript as HTMLScriptElement | null) ?? findOurScript();
  if (!candidate) return null;
  if (candidate.dataset.geuInit === '1') return null;
  candidate.dataset.geuInit = '1';

  const widgetId = candidate.getAttribute('data-widget-id');
  const dataSrc = candidate.getAttribute('data-src');
  const mountSelector = candidate.getAttribute('data-mount');

  if (!widgetId && !dataSrc) {
    console.error('[Open Embed UI] <script> tag must have either data-widget-id or data-src.');
    return null;
  }

  const theme = (candidate.getAttribute('data-theme') ?? 'system') as 'light' | 'dark' | 'system';
  // Only derive baseUrl in API mode. Static mode (dataSrc) does not need it.
  // Build the full replacement regex from the caller-supplied filename pattern,
  // re-anchoring it to strip /filename.js and any trailing query string.
  const srcPattern = srcRegex.source.replace(/\$$/, ''); // strip trailing $ if present
  const baseUrlRegex = new RegExp(`\\/${srcPattern}(\\?.*)?$`);
  const baseUrl = dataSrc ? undefined : candidate.src.replace(baseUrlRegex, '');

  let host: HTMLElement | null = null;
  if (mountSelector) {
    host = document.querySelector(mountSelector);
    if (!host) {
      console.error(`[Open Embed UI] data-mount target not found: ${mountSelector}`);
      return null;
    }
    // Don't double-mount into the same target
    if (host.shadowRoot) return null;
  } else {
    host = document.createElement('div');
    host.setAttribute('data-geu-widget', widgetId ?? 'static');
    candidate.parentElement?.insertBefore(host, candidate);
  }

  return { host, widgetId, dataSrc, baseUrl, theme };
}

/**
 * Boot using a pre-bundled layout component. Per-layout IIFE entries call
 * this so only one layout is ever bundled (no reference to layout-map.ts).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function bootWithLayout(_layout: WidgetLayout, LayoutComponent: ComponentType<any>): void {
  const doInit = () => {
    const prepared = readScriptTagAndPrepareHost(/widget-[a-z-]+\.js$/);
    if (!prepared) return;

    const { host, widgetId, dataSrc, baseUrl, theme } = prepared;
    const { container } = createShadowDOM(host);
    renderWidget(container, {
      ...(widgetId ? { widgetId } : {}),
      ...(dataSrc ? { dataSrc } : {}),
      ...(baseUrl ? { baseUrl } : {}),
      theme,
    }, LayoutComponent);
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', doInit);
    } else {
      doInit();
    }
  }
}

// --- Theme utilities ---

export function resolveTheme(explicit?: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (explicit === 'dark' || explicit === 'light') return explicit;

  const html = document.documentElement;
  const body = document.body;
  const hasClass = (el: HTMLElement | null, c: string) => !!el && el.classList.contains(c);
  const attr = (el: HTMLElement | null, name: string) => el?.getAttribute(name);

  if (hasClass(html, 'dark') || hasClass(body, 'dark')) return 'dark';
  if (hasClass(html, 'light') || hasClass(body, 'light')) return 'light';

  for (const name of ['data-theme', 'data-mode']) {
    const v = attr(html, name) || attr(body, name);
    if (v === 'dark') return 'dark';
    if (v === 'light') return 'light';
  }

  try {
    const ls = localStorage.getItem('theme');
    if (ls === 'dark' || ls === 'light') return ls;
  } catch {
    /* storage blocked */
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function observeTheme(onChange: () => void): void {
  const filter = ['class', 'data-theme', 'data-mode'];
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: filter });
  if (document.body) {
    observer.observe(document.body, { attributes: true, attributeFilter: filter });
  }

  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', onChange);
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme') onChange();
  });
}
