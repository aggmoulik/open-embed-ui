import { useEffect, useRef, useCallback } from 'preact/hooks';

interface WidgetHostProps {
  widgetId: string;
  theme: string;
  baseUrl: string;
}

declare global {
  interface Window {
    GitHubEmbedWidget?: {
      mount: (el: HTMLElement, options: { widgetId: string; theme?: string; baseUrl?: string }) => void;
      unmount: (el: HTMLElement) => void;
    };
  }
}

export function WidgetHost({ widgetId, theme, baseUrl }: WidgetHostProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const mountWidget = useCallback(() => {
    if (!containerRef.current || !window.GitHubEmbedWidget?.mount || !widgetId) return;

    // Remove previous host
    if (hostRef.current) {
      try { window.GitHubEmbedWidget.unmount(hostRef.current); } catch {}
      hostRef.current.remove();
      hostRef.current = null;
    }

    const host = document.createElement('div');
    containerRef.current.appendChild(host);
    hostRef.current = host;

    window.GitHubEmbedWidget.mount(host, { widgetId, theme, baseUrl });
  }, [widgetId, theme, baseUrl]);

  // Load widget.js and mount
  useEffect(() => {
    const scriptId = 'geu-widget-script';
    const existing = document.getElementById(scriptId);

    if (existing) {
      mountWidget();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `${baseUrl}/widget.js`;
    script.async = true;
    script.onload = mountWidget;
    document.head.appendChild(script);

    return () => {
      if (hostRef.current) {
        try { window.GitHubEmbedWidget?.unmount(hostRef.current); } catch {}
        hostRef.current.remove();
        hostRef.current = null;
      }
    };
  }, [mountWidget, baseUrl]);

  // Theme changes via postMessage
  useEffect(() => {
    window.postMessage({ type: 'geu-theme', theme }, '*');
  }, [theme]);

  return <div ref={containerRef} />;
}
