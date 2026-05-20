'use client';

import { useMemo } from 'react';
import { Skeleton } from '@open-embed-ui/ui/components/skeleton';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="border-border bg-background flex w-full max-w-5xl flex-col overflow-hidden rounded-xl border shadow-2xl"
        style={{ height: 'min(85vh, 750px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-border bg-muted/30 flex shrink-0 items-center justify-between border-b border-dashed px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-mono text-[10px] tracking-[0.08em] uppercase">
              // live preview
            </span>
            <span className="text-muted-foreground/70 font-mono text-[10px] tracking-[0.08em] uppercase">
              {filteredContributions.length} prs · {config.layout ?? 'grid'} ·{' '}
              {config.preset ?? 'default'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground inline-flex size-7 items-center justify-center rounded-md border transition-colors"
          >
            <X className="size-3.5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Browser chrome — same as the landing WidgetDemo */}
        <div className="border-border bg-muted/40 flex shrink-0 items-center gap-3 border-b px-3.5 py-2.5">
          <div className="flex gap-1.5">
            <span className="bg-border size-2.5 rounded-full" />
            <span className="bg-border size-2.5 rounded-full" />
            <span className="bg-border size-2.5 rounded-full" />
          </div>
          <div className="border-border bg-background text-muted-foreground flex h-[26px] flex-1 items-center gap-0.5 rounded-md border px-2.5 font-mono text-[12px]">
            <span>https://</span>
            <b className="text-foreground font-semibold">your-portfolio.dev</b>
            <span>/now</span>
          </div>
        </div>

        <div className="marketing-dot-bg bg-background flex-1 overflow-auto p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : hasData ? (
            <WidgetRenderer contributions={filteredContributions} config={config} />
          ) : (
            <div className="text-muted-foreground flex items-center justify-center py-20 font-mono text-[13px]">
              <span className="text-brand mr-2">●</span> Widget not found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
