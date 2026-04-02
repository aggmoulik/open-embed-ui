'use client';

import { WidgetHost } from '@/components/widget-host';
import type { Viewport } from './viewport-selector';
import { getViewportWidth } from './viewport-selector';

interface PreviewCanvasProps {
  widgetId: string;
  theme: 'light' | 'dark' | 'system';
  viewport: Viewport;
}

export function PreviewCanvas({ widgetId, theme, viewport }: PreviewCanvasProps) {
  const width = getViewportWidth(viewport);
  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-gray-950' : theme === 'light' ? 'bg-white' : 'bg-background';

  return (
    <div
      className={`flex items-start justify-center rounded-lg border p-6 transition-colors ${bg}`}
    >
      <div className="mx-auto rounded-lg transition-all" style={{ width, maxWidth: '100%' }}>
        <WidgetHost widgetId={widgetId} theme={theme} className="p-4" />
      </div>
    </div>
  );
}
