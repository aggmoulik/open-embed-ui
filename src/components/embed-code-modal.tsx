'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Copy, Check, X, ExternalLink } from 'lucide-react';

interface EmbedCodeModalProps {
  widgetId: string;
  open: boolean;
  onClose: () => void;
}

interface EmbedCodes {
  directUrl: string;
  iframe: string;
  script: string;
}

export function EmbedCodeModal({ widgetId, open, onClose }: EmbedCodeModalProps) {
  const [codes, setCodes] = useState<EmbedCodes | null>(null);
  const [tab, setTab] = useState<'iframe' | 'script'>('iframe');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/widgets/${widgetId}/embed-code`, { credentials: 'include' })
      .then((r) => r.json())
      .then(setCodes)
      .catch(() => setCodes(null));
  }, [open, widgetId]);

  const copyCode = useCallback(() => {
    if (!codes) return;
    const text = tab === 'iframe' ? codes.iframe : codes.script;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [codes, tab]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-background mx-4 w-full max-w-lg rounded-xl border p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="size-5" />
            <h2 className="text-lg font-semibold">Embed Widget</h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant={tab === 'iframe' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab('iframe')}
          >
            iframe
          </Button>
          <Button
            variant={tab === 'script' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab('script')}
          >
            Script Tag
          </Button>
        </div>

        {codes ? (
          <>
            <div className="relative mt-3">
              <pre className="bg-muted max-h-40 overflow-auto rounded-lg p-3 text-xs">
                <code>{tab === 'iframe' ? codes.iframe : codes.script}</code>
              </pre>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" className="gap-1.5" onClick={copyCode}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
              <a href={`${codes.directUrl}/preview`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ExternalLink className="size-3.5" />
                  Preview
                </Button>
              </a>
            </div>

            <p className="text-muted-foreground mt-3 text-xs">
              {tab === 'iframe'
                ? 'Paste this HTML anywhere on your site. The iframe renders without JavaScript.'
                : 'The script tag auto-resizes the embed to fit its content. Requires JavaScript.'}
            </p>
          </>
        ) : (
          <div className="text-muted-foreground mt-4 flex items-center justify-center py-8 text-sm">
            Loading embed codes...
          </div>
        )}
      </div>
    </div>
  );
}
