import { useState, useEffect } from 'preact/hooks';
import { Toolbar } from '../components/Toolbar';
import { ViewportFrame } from '../components/ViewportFrame';
import { WidgetHost } from '../components/WidgetHost';

export function Preview() {
  const params = new URLSearchParams(window.location.search);
  const widgetId = params.get('id') ?? '';
  const initialTheme = params.get('theme') ?? 'system';
  const baseUrl = params.get('baseUrl') ?? window.location.origin;

  const [theme, setTheme] = useState(initialTheme);
  const [viewport, setViewport] = useState('desktop');
  const [widgetName, setWidgetName] = useState('Widget Preview');

  // Fetch widget name
  useEffect(() => {
    if (!widgetId) return;
    fetch(`${baseUrl}/api/embed/${widgetId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.widget?.name) setWidgetName(data.widget.name);
      })
      .catch(() => {});
  }, [widgetId, baseUrl]);

  // Apply theme class to root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      }
    }
  }, [theme]);

  if (!widgetId) {
    return (
      <div class="preview-app">
        <div class="preview-error">
          <p>No widget ID provided.</p>
          <p style={{ marginTop: '8px', color: '#9ca3af' }}>
            Usage: <code>?id=YOUR_WIDGET_ID</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div class="preview-app">
      <Toolbar
        title={widgetName}
        theme={theme}
        viewport={viewport}
        onThemeChange={setTheme}
        onViewportChange={setViewport}
      />
      <ViewportFrame viewport={viewport}>
        <WidgetHost widgetId={widgetId} theme={theme} baseUrl={baseUrl} />
      </ViewportFrame>
      <div class="preview-footer">Powered by Open Embed UI</div>
    </div>
  );
}
