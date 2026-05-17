'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@open-embed-ui/ui/components/button';
import { Card, CardContent } from '@open-embed-ui/ui/components/card';
import { Skeleton } from '@open-embed-ui/ui/components/skeleton';
import { Badge } from '@open-embed-ui/ui/components/badge';
import {
  Box,
  Plus,
  Pencil,
  Trash2,
  Code,
  Eye,
  LayoutGrid,
  List,
  Clock,
  CreditCard,
  GalleryHorizontal,
  Presentation,
  LayoutDashboard,
  Star,
  Receipt,
  ScrollText,
  Trophy,
  TerminalSquare,
  GitBranch,
  Award,
} from 'lucide-react';
import { useWidgets } from '@/hooks';
import { deleteWidget } from '@/lib/api-client';
import { ConfirmDialog } from '@open-embed-ui/ui/components/confirm-dialog';
import { EmbedCodeModal } from '@/components/embed-code-modal';
import { PreviewModal } from '@/components/preview-modal';
import { useState } from 'react';
import type { Widget } from '@/types';

const layoutIcons = {
  grid: LayoutGrid,
  list: List,
  timeline: Clock,
  'single-card': CreditCard,
  marquee: GalleryHorizontal,
  carousel: Presentation,
  masonry: LayoutDashboard,
  highlight: Star,
  terminal: Receipt,
  log: ScrollText,
  scorecard: Trophy,
  gitlog: TerminalSquare,
  devlog: GitBranch,
  proof: Award,
};

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
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Widgets</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create and manage embeddable contribution widgets.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => router.push('/dashboard/widgets/new')}>
          <Plus className="size-3.5" />
          New Widget
        </Button>
      </div>

      {error && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-lg border p-3 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-lg" />
            ))}
          </>
        ) : widgets.length > 0 ? (
          widgets.map((widget) => {
            const layout = widget.config?.layout ?? 'grid';
            const LayoutIcon = layoutIcons[layout] ?? LayoutGrid;

            return (
              <Card key={widget.id} className="hover:bg-muted/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium">{widget.name}</h3>
                      {widget.description && (
                        <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                          {widget.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0 gap-1 text-xs">
                      <LayoutIcon className="size-3" />
                      {layout}
                    </Badge>
                  </div>

                  <div className="text-muted-foreground mt-3 flex flex-wrap gap-1.5 text-xs">
                    {widget.config?.theme && <Badge variant="outline">{widget.config.theme}</Badge>}
                    {widget.config?.timeRange && widget.config.timeRange !== 'all' && (
                      <Badge variant="outline">{widget.config.timeRange}</Badge>
                    )}
                    {widget.config?.maxItems && (
                      <Badge variant="outline">max {widget.config.maxItems}</Badge>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link href={`/dashboard/widgets/${widget.id}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Pencil className="size-3" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => setPreviewWidgetId(widget.id)}
                    >
                      <Eye className="size-3" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => setEmbedWidgetId(widget.id)}
                    >
                      <Code className="size-3" />
                      Embed
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 gap-1"
                      onClick={() => setDeleteTarget(widget)}
                    >
                      <Trash2 className="size-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <Box className="text-muted-foreground/50 size-10" />
            <h3 className="mt-4 text-lg font-medium">No widgets yet</h3>
            <p className="text-muted-foreground mt-1 max-w-xs text-sm">
              Create your first widget to showcase your merged PRs on any website.
            </p>
            <Button className="mt-4 gap-1.5" onClick={() => router.push('/dashboard/widgets/new')}>
              <Plus className="size-3.5" />
              Create Widget
            </Button>
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
        title="Delete Widget"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
