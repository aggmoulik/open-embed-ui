'use client';

import { useMemo } from 'react';
import { Button } from '@github-embed-ui/ui/components/button';
import { Badge } from '@github-embed-ui/ui/components/badge';
import { Skeleton } from '@github-embed-ui/ui/components/skeleton';
import { X } from 'lucide-react';
import { useWidget, useContributions } from '@/hooks';
import { WidgetRenderer } from '@/components/widget-preview/widget-renderer';
import type { Contribution, WidgetConfig } from '@/types';

interface PreviewModalProps {
  widgetId: string;
  open: boolean;
  onClose: () => void;
  currentConfig?: WidgetConfig;
  currentContributions?: Contribution[];
}

export function PreviewModal({
  widgetId,
  open,
  onClose,
  currentConfig,
  currentContributions,
}: PreviewModalProps) {
  // When currentConfig + currentContributions are provided (widget builder),
  // skip fetching widget and contributions entirely — the parent already has
  // the data. This avoids a redundant /api/contributions call on every
  // preview open.
  const hasInlineData = !!(currentConfig && currentContributions);

  const { data: widget, loading: widgetLoading } = useWidget(hasInlineData ? null : widgetId);
  const { data: allContributions, loading: contributionsLoading } = useContributions(
    hasInlineData ? null : undefined,
  );

  const config = currentConfig ?? widget?.config ?? {};

  const filteredContributions = useMemo(() => {
    if (currentContributions) return currentContributions;

    let result: Contribution[] = [...allContributions];

    result.sort((a, b) => {
      const aTime = a.mergedAt ? new Date(a.mergedAt).getTime() : 0;
      const bTime = b.mergedAt ? new Date(b.mergedAt).getTime() : 0;
      return bTime - aTime;
    });

    if (config.selectedPRs) {
      const selectedSet = new Set(config.selectedPRs);
      result = result.filter((c) => selectedSet.has(c.id));
    }

    if (config.maxItems) {
      result = result.slice(0, config.maxItems);
    }

    return result;
  }, [currentContributions, allContributions, config.selectedPRs, config.maxItems]);

  if (!open) return null;

  const loading = !hasInlineData && (widgetLoading || contributionsLoading);
  const hasData = hasInlineData || widget;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background flex w-full max-w-5xl flex-col overflow-hidden rounded-xl border shadow-2xl"
        style={{ height: 'min(85vh, 750px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-medium">Widget Preview</span>
            <Badge variant="outline" className="text-[10px]">
              {filteredContributions.length} PRs shown
            </Badge>
          </div>
          <Button variant="ghost" size="icon-xs" onClick={onClose}>
            <X className="size-3.5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="bg-background rounded-lg border p-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : hasData ? (
              <WidgetRenderer contributions={filteredContributions} config={config} />
            ) : (
              <div className="text-muted-foreground flex items-center justify-center py-20 text-sm">
                Widget not found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
