import { render } from 'preact';
import { createShadowDOM, renderWidget, readScriptTagAndPrepareHost } from './boot';
import { layoutResolver, LEGACY_LAYOUT_FALLBACK } from './layout-map';
import type { WidgetOptions } from './types';
// Re-export bootWithLayout so entry files can import it from here if needed,
// but the per-layout entries import directly from './boot' to avoid pulling
// in layout-map.ts.
export { bootWithLayout } from './boot';

export { Widget as GitHubWidget } from './Widget';
export type { WidgetOptions, WidgetData, WidgetConfig, WidgetLayout, Contribution } from './types';

/**
 * Mount the widget into a Shadow DOM inside the given element.
 * Uses the full layout-map resolver so any layout can be displayed.
 */
export function mount(selector: string | HTMLElement, options: WidgetOptions): void {
  const target = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!target) {
    console.error(`[Open Embed UI] Target element not found: ${selector}`);
    return;
  }

  const { container } = createShadowDOM(target as HTMLElement);
  renderWidget(container, options, undefined, layoutResolver, LEGACY_LAYOUT_FALLBACK);
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

// --- Auto-initialize from <script> tag ---
function autoInit() {
  const prepared = readScriptTagAndPrepareHost(/widget\.js$/);
  if (!prepared) return;

  const { host, widgetId, dataSrc, baseUrl, theme } = prepared;
  mount(host, {
    ...(widgetId ? { widgetId } : {}),
    ...(dataSrc ? { dataSrc } : {}),
    ...(baseUrl ? { baseUrl } : {}),
    theme,
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
}
