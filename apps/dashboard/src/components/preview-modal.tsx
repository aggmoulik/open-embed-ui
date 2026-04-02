'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@github-embed-ui/ui/components/button';
import { Badge } from '@github-embed-ui/ui/components/badge';
import { Skeleton } from '@github-embed-ui/ui/components/skeleton';
import { X, Sun, Moon, Monitor, Pencil, Code } from 'lucide-react';
import { useWidget, useContributions } from '@/hooks';
import { WidgetRenderer } from '@/components/widget-preview/widget-renderer';
import { ViewportSelector, getViewportWidth, type Viewport } from '@/components/widget-preview/viewport-selector';
import { EmbedCodeModal } from '@/components/embed-code-modal';
import type { Contribution } from '@/types';

interface PreviewModalProps {
  widgetId: string;
  open: boolean;
  onClose: () => void;
}

export function PreviewModal({ widgetId, open, onClose }: PreviewModalProps) {
  const { data: widget, loading: widgetLoading } = useWidget(widgetId);
  const { data: allContributions, loading: contributionsLoading } = useContributions();

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [showEmbed, setShowEmbed] = useState(false);

  const config = widget?.config ?? {};

  const filteredContributions = useMemo(() => {
    let result: Contribution[] = [...allContributions];

    // Apply time range filter
    if (config.timeRange && config.timeRange !== 'all') {
      const now = Date.now();
      const ranges = { week: 7, month: 30, year: 365 };
      const days = ranges[config.timeRange];
      const since = now - days * 24 * 60 * 60 * 1000;
      result = result.filter((c) => c.mergedAt && new Date(c.mergedAt).getTime() > since);
    }

    // Sort by merge date
    result.sort((a, b) => {
      const aTime = a.mergedAt ? new Date(a.mergedAt).getTime() : 0;
      const bTime = b.mergedAt ? new Date(b.mergedAt).getTime() : 0;
      return bTime - aTime;
    });

    // Apply selected PRs filter
    if (config.selectedPRs) {
      const selectedSet = new Set(config.selectedPRs);
      result = result.filter((c) => selectedSet.has(c.id));
    }

    // Apply max items
    if (config.maxItems) {
      result = result.slice(0, config.maxItems);
    }

    return result;
  }, [allContributions, config.timeRange, config.selectedPRs, config.maxItems]);

  if (!open) return null;

  const themeClass =
    theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : '';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50" onClick={onClose}>
      <div
        className="flex h-full flex-col bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              {widgetLoading ? 'Loading...' : (widget?.name ?? 'Widget Preview')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/widgets/${widgetId}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pencil className="size-3.5" />
                Edit Widget
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowEmbed(true)}
            >
              <Code className="size-3.5" />
              Embed
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 border-b px-4 py-2 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Theme</span>
            <div className="flex gap-1">
              <Button variant={theme === 'light' ? 'default' : 'outline'} size="icon-sm" onClick={() => setTheme('light')} title="Light">
                <Sun className="size-3.5" />
              </Button>
              <Button variant={theme === 'dark' ? 'default' : 'outline'} size="icon-sm" onClick={() => setTheme('dark')} title="Dark">
                <Moon className="size-3.5" />
              </Button>
              <Button variant={theme === 'system' ? 'default' : 'outline'} size="icon-sm" onClick={() => setTheme('system')} title="System">
                <Monitor className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Viewport</span>
            <ViewportSelector value={viewport} onChange={setViewport} />
          </div>

          <div className="ml-auto">
            <Badge variant="outline" className="text-xs">
              {config.layout ?? 'grid'}
            </Badge>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-start justify-center">
            <div
              className={`mx-auto rounded-lg border bg-background p-4 transition-all ${themeClass}`}
              style={{ width: getViewportWidth(viewport), maxWidth: '100%' }}
            >
              {widgetLoading || contributionsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : widget ? (
                <WidgetRenderer contributions={filteredContributions} config={config} />
              ) : (
                <div className="flex items-center justify-center py-20 text-muted-foreground">
                  Widget not found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embed Modal */}
      {showEmbed && (
        <EmbedCodeModal widgetId={widgetId} open={showEmbed} onClose={() => setShowEmbed(false)} />
      )}
    </div>
  );
}
