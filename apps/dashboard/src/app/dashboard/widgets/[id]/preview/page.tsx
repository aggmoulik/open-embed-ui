'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@github-embed-ui/ui/components/button';
import { Badge } from '@github-embed-ui/ui/components/badge';
import { Skeleton } from '@github-embed-ui/ui/components/skeleton';
import { ArrowLeft, Sun, Moon, Monitor, Code, Pencil } from 'lucide-react';
import { useWidget } from '@/hooks';
import { PreviewCanvas } from '@/components/widget-preview/preview-canvas';
import { ViewportSelector, type Viewport } from '@/components/widget-preview/viewport-selector';
import { EmbedCodeModal } from '@/components/embed-code-modal';

export default function WidgetPreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: widget, loading } = useWidget(params.id);

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [showEmbed, setShowEmbed] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!widget) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Widget not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/widgets')}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{widget.name}</h1>
          <p className="text-xs text-muted-foreground">Widget Preview</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => router.push(`/dashboard/widgets/${params.id}`)}
          >
            <Pencil className="size-3.5" />
            Edit Widget
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowEmbed(true)}
          >
            <Code className="size-3.5" />
            Embed
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted/30 p-3">
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
            {widget.config?.layout ?? 'grid'}
          </Badge>
        </div>
      </div>

      {/* Preview Canvas */}
      <PreviewCanvas widgetId={params.id} theme={theme} viewport={viewport} />

      {/* Embed Modal */}
      {showEmbed && (
        <EmbedCodeModal widgetId={params.id} open={showEmbed} onClose={() => setShowEmbed(false)} />
      )}
    </div>
  );
}
