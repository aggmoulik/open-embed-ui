'use client';

import { useEffect, useRef, useCallback } from 'react';
import Script from 'next/script';

interface WidgetHostProps {
  widgetId: string;
  theme?: 'light' | 'dark' | 'system';
  className?: string;
}

declare global {
  interface Window {
    GitHubEmbedWidget?: {
      mount: (el: HTMLElement, options: { widgetId: string; theme?: string; baseUrl?: string }) => void;
      unmount: (el: HTMLElement) => void;
    };
  }
}

export function WidgetHost({ widgetId, theme = 'system', className }: WidgetHostProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const mountWidget = useCallback(() => {
    if (!containerRef.current || !window.GitHubEmbedWidget?.mount || !widgetId) return;

    // Clean up previous mount — remove the old host entirely to avoid
    // "Shadow root cannot be created on a host which already hosts a shadow tree"
    if (hostRef.current) {
      try {
        window.GitHubEmbedWidget.unmount(hostRef.current);
      } catch {}
      hostRef.current.remove();
      hostRef.current = null;
    }

    // Create a fresh host div for the Shadow DOM
    const host = document.createElement('div');
    containerRef.current.appendChild(host);
    hostRef.current = host;

    window.GitHubEmbedWidget.mount(host, {
      widgetId,
      theme,
      baseUrl: window.location.origin,
    });
  }, [widgetId, theme]);

  // Mount when script loads or when widgetId/theme changes
  useEffect(() => {
    mountWidget();

    return () => {
      if (hostRef.current) {
        try {
          window.GitHubEmbedWidget?.unmount(hostRef.current);
        } catch {}
        hostRef.current.remove();
        hostRef.current = null;
      }
    };
  }, [mountWidget]);

  // Send theme changes to existing widget via postMessage
  useEffect(() => {
    window.postMessage({ type: 'geu-theme', theme }, '*');
  }, [theme]);

  return (
    <>
      <Script
        src="/widget.js"
        strategy="afterInteractive"
        onLoad={mountWidget}
      />
      <div ref={containerRef} className={className} />
    </>
  );
}
