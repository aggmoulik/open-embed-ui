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
    console.error(`[GitHub Embed UI] Target element not found: ${selector}`);
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
  const isDark =
    options.theme === 'dark' ||
    (options.theme !== 'light' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);

  const wrapper = document.createElement('div');
  wrapper.className = `geu-widget${isDark ? ' dark' : ''}`;
  container.appendChild(wrapper);

  render(h(Widget, { options }), wrapper);

  // Listen for theme changes from parent
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'geu-theme') {
      if (e.data.theme === 'dark') {
        wrapper.classList.add('dark');
      } else if (e.data.theme === 'light') {
        wrapper.classList.remove('dark');
      } else {
        // system
        const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        wrapper.classList.toggle('dark', !!systemDark);
      }
    }
  });
}

// --- Auto-initialize from <script> tag ---
function autoInit() {
  const script = document.currentScript as HTMLScriptElement | null;
  if (!script) return;

  const widgetId = script.getAttribute('data-widget-id');
  if (!widgetId) return;

  const theme = script.getAttribute('data-theme') as 'light' | 'dark' | 'system' | null;
  const baseUrl = script.src.replace(/\/widget\.js(\?.*)?$/, '');

  // Create host element next to the script tag
  const host = document.createElement('div');
  host.setAttribute('data-geu-widget', widgetId);
  script.parentElement?.insertBefore(host, script);

  mount(host, { widgetId, theme: theme ?? 'system', baseUrl });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
}
