'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@open-embed-ui/ui/components/skeleton';
import { Box, Plus, Pencil, Trash2, Code, Eye, LayoutGrid } from 'lucide-react';
import { useWidgets } from '@/hooks';
import { deleteWidget } from '@/lib/api-client';
import { ConfirmDialog } from '@open-embed-ui/ui/components/confirm-dialog';
import { EmbedCodeModal } from '@/components/embed-code-modal';
import { PreviewModal } from '@/components/preview-modal';
import { useState } from 'react';
import { layoutIcons } from '@/lib/layouts';
import { PageHeader } from '@/components/page-header';
import type { Widget } from '@/types';

export default function WidgetsPage() {
  const { data: widgets, loading, error, refetch } = useWidgets();
  const router = useRouter();
  const [embedWidgetId, setEmbedWidgetId] = useState<string | null>(null);
  const [previewWidgetId, setPreviewWidgetId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Widget | null>(null);

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteWidget(deleteTarget.id);
      refetch();
      toast.error(`"${deleteTarget.name}" deleted`);
    } catch {
      toast.error('Failed to delete widget');
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        num="03"
        eyebrow="widgets"
        title="My widgets"
        lead="Create, configure, and grab the embed code for any of the production layouts."
        actions={
          <button
            type="button"
            onClick={() => router.push('/dashboard/widgets/new')}
            className="border-foreground bg-foreground text-background hover:bg-foreground/90 inline-flex h-[30px] items-center gap-2 rounded-md border px-3 font-mono text-[12px] font-medium transition-colors"
          >
            <Plus className="size-3.5" strokeWidth={2} />
            New widget
          </button>
        }
      />

      {error && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive mb-4 rounded-md border p-3 font-mono text-[12px]">
          <span className="font-semibold">// error: </span>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </>
        ) : widgets.length > 0 ? (
          widgets.map((widget) => {
            const layout = widget.config?.layout ?? 'grid';
            const LayoutIcon = layoutIcons[layout] ?? LayoutGrid;

            return (
              <div
                key={widget.id}
                className="border-border bg-background hover:border-foreground/30 hover:-translate-y-px hover:shadow-[0_1px_0_rgba(0,0,0,.02),0_4px_16px_rgba(0,0,0,.05)] group flex flex-col overflow-hidden rounded-xl border transition-all"
              >
                <div className="border-border bg-muted/30 flex items-start justify-between border-b p-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-sans text-[15px] font-semibold tracking-[-0.01em]">
                      {widget.name}
                    </h3>
                    {widget.description && (
                      <p className="text-muted-foreground mt-1 line-clamp-1 text-[13px]">
                        {widget.description}
                      </p>
                    )}
                  </div>
                  <span className="border-border bg-background text-foreground/90 ml-2 inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 font-mono text-[11px]">
                    <LayoutIcon className="size-3" strokeWidth={1.75} />
                    {layout}
                  </span>
                </div>

                <div className="flex flex-1 flex-wrap items-center gap-1.5 px-4 py-3 font-mono text-[11px] text-muted-foreground">
                  {widget.config?.theme && (
                    <span className="border-border rounded-sm border px-1.5 py-0.5">
                      {widget.config.theme}
                    </span>
                  )}
                  {widget.config?.timeRange && widget.config.timeRange !== 'all' && (
                    <span className="border-border rounded-sm border px-1.5 py-0.5">
                      {widget.config.timeRange}
                    </span>
                  )}
                  {widget.config?.maxItems && (
                    <span className="border-border rounded-sm border px-1.5 py-0.5">
                      max {widget.config.maxItems}
                    </span>
                  )}
                </div>

                <div className="border-border flex border-t">
                  <Link
                    href={`/dashboard/widgets/${widget.id}`}
                    className="border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 inline-flex h-9 flex-1 items-center justify-center gap-1.5 border-r font-mono text-[11px] transition-colors"
                  >
                    <Pencil className="size-3" strokeWidth={1.75} />
                    edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPreviewWidgetId(widget.id)}
                    className="border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 inline-flex h-9 flex-1 items-center justify-center gap-1.5 border-r font-mono text-[11px] transition-colors"
                  >
                    <Eye className="size-3" strokeWidth={1.75} />
                    preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmbedWidgetId(widget.id)}
                    className="border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 inline-flex h-9 flex-1 items-center justify-center gap-1.5 border-r font-mono text-[11px] transition-colors"
                  >
                    <Code className="size-3" strokeWidth={1.75} />
                    embed
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(widget)}
                    aria-label="Delete widget"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 inline-flex h-9 w-10 items-center justify-center transition-colors"
                  >
                    <Trash2 className="size-3" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="border-border bg-muted/20 col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
            <Box className="text-muted-foreground/50 size-10" strokeWidth={1.5} />
            <div className="marketing-section-eyebrow mt-5 inline-block font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              empty state
            </div>
            <h3 className="mt-1 font-sans text-[18px] font-semibold tracking-[-0.01em]">
              No widgets yet
            </h3>
            <p className="text-muted-foreground mt-1.5 max-w-[360px] text-[14px]">
              Create your first widget to showcase your merged PRs on any website.
            </p>
            <button
              type="button"
              onClick={() => router.push('/dashboard/widgets/new')}
              className="border-foreground bg-foreground text-background hover:bg-foreground/90 mt-5 inline-flex h-[34px] items-center gap-2 rounded-md border px-4 font-mono text-[12px] font-medium transition-colors"
            >
              <Plus className="size-3.5" strokeWidth={2} />
              Create widget
            </button>
          </div>
        )}
      </div>

      {embedWidgetId && (
        <EmbedCodeModal
          widgetId={embedWidgetId}
          open={!!embedWidgetId}
          onClose={() => setEmbedWidgetId(null)}
        />
      )}

      {previewWidgetId && (
        <PreviewModal
          widgetId={previewWidgetId}
          open={!!previewWidgetId}
          onClose={() => setPreviewWidgetId(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete widget"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
