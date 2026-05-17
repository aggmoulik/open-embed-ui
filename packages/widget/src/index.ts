import { render, h } from 'preact';
import { Widget } from './Widget';
import type { WidgetOptions } from './types';
// @ts-ignore — imported by rollup-plugin-postcss
import cssText from './styles/widget.css';

/**
 * Mount the widget into a Shadow DOM inside the given element.
 */
export function mount(selector: string | HTMLElement, options: WidgetOptions): void {
  const target = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!target) {
    console.error(`[Open Embed UI] Target element not found: ${selector}`);
    return;
  }

  const { shadowRoot, container } = createShadowDOM(target as HTMLElement);
  renderWidget(container, options);
}

/**
 * Unmount the widget from the given element.
 */
export function unmount(selector: string | HTMLElement): void {
  const target = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!target) return;
  const shadow = target.shadowRoot;
  if (shadow) {
    const container = shadow.getElementById('geu-root');
    if (container) render(null, container);
  }
}

export { Widget as GitHubWidget } from './Widget';
export type { WidgetOptions, WidgetData, WidgetConfig, WidgetLayout, Contribution } from './types';

// --- Private ---

function createShadowDOM(host: HTMLElement) {
  const shadowRoot = host.attachShadow({ mode: 'open' });

  // Inject styles
  const style = document.createElement('style');
  style.textContent = typeof cssText === 'string' ? cssText : '';
  shadowRoot.appendChild(style);

  // Create mount container
  const container = document.createElement('div');
  container.id = 'geu-root';
  shadowRoot.appendChild(container);

  return { shadowRoot, container };
}

function renderWidget(container: HTMLElement, options: WidgetOptions) {
  const wrapper = document.createElement('div');
  wrapper.className = 'geu-widget';
  container.appendChild(wrapper);

  const applyTheme = () => {
    wrapper.classList.toggle('dark', resolveTheme(options.theme) === 'dark');
  };

  applyTheme();
  render(h(Widget, { options }), wrapper);

  // Auto-observe theme changes only when user hasn't pinned light/dark.
  if (options.theme !== 'dark' && options.theme !== 'light') {
    observeTheme(applyTheme);
  }

  // Keep the postMessage API for explicit control from the host (backward compat).
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'geu-theme') {
      if (e.data.theme === 'dark') wrapper.classList.add('dark');
      else if (e.data.theme === 'light') wrapper.classList.remove('dark');
      else applyTheme(); // "system" → re-resolve from host
    }
  });
}

/**
 * Auto-detect the host site's current theme. First match wins:
 *   1. Explicit option ('light' or 'dark')
 *   2. `class="dark"` on <html> or <body>        (Tailwind, shadcn, DaisyUI, …)
 *   3. `data-theme="dark"` on <html> or <body>   (Pico.css, some docs sites)
 *   4. `data-mode="dark"` on <html> or <body>    (other docs frameworks)
 *   5. `localStorage.theme === 'dark'`           (Tailwind's recommended SSR pattern)
 *   6. `prefers-color-scheme: dark` media query  (fallback)
 */
function resolveTheme(explicit?: 'light' | 'dark' | 'system'): 'light' | 'dark' {
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
    /* storage blocked (incognito / sandboxed iframe) */
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Watch for host theme changes and call `onChange` whenever anything relevant
 * flips. Covers class toggles, data-attr changes, cross-tab localStorage
 * updates, and system-preference changes. One observer for <html> + <body>.
 */
function observeTheme(onChange: () => void): void {
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

// --- Auto-initialize from <script> tag ---
function autoInit() {
  // `document.currentScript` is null when the script is loaded `async` and reaches
  // execution after the parser has moved on. Fall back to scanning for any of our
  // script tags that haven't initialized yet (idempotent: marked with data-geu-init).
  const candidate = (document.currentScript as HTMLScriptElement | null) ?? findOurScript();
  if (!candidate) return;
  if (candidate.dataset.geuInit === '1') return;
  candidate.dataset.geuInit = '1';

  const widgetId = candidate.getAttribute('data-widget-id');
  const dataSrc = candidate.getAttribute('data-src');
  const mountSelector = candidate.getAttribute('data-mount');

  if (!widgetId && !dataSrc) {
    console.error('[Open Embed UI] <script> tag must have either data-widget-id or data-src.');
    return;
  }

  const theme = candidate.getAttribute('data-theme') as 'light' | 'dark' | 'system' | null;
  // Only derive baseUrl in API mode. Static mode does not need it.
  const baseUrl = dataSrc ? undefined : candidate.src.replace(/\/widget\.js(\?.*)?$/, '');

  // Resolve mount target:
  // - data-mount: existing element selected by the host (preferred for predictable layout)
  // - else: create a host div next to the script tag (back-compat)
  let host: HTMLElement | null = null;
  if (mountSelector) {
    host = document.querySelector(mountSelector);
    if (!host) {
      console.error(`[Open Embed UI] data-mount target not found: ${mountSelector}`);
      return;
    }
    // Don't double-mount into the same target
    if (host.shadowRoot) return;
  } else {
    host = document.createElement('div');
    host.setAttribute('data-geu-widget', widgetId ?? 'static');
    candidate.parentElement?.insertBefore(host, candidate);
  }

  mount(host, {
    ...(widgetId ? { widgetId } : {}),
    ...(dataSrc ? { dataSrc } : {}),
    ...(baseUrl ? { baseUrl } : {}),
    theme: theme ?? 'system',
  });
}

function findOurScript(): HTMLScriptElement | null {
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    'script[data-widget-id]:not([data-geu-init]), script[data-src]:not([data-geu-init])',
  );
  // Prefer the last one (most recently inserted that matches our contract)
  return scripts[scripts.length - 1] ?? null;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
}
