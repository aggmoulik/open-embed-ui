'use client';

import { useCallback, useState } from 'react';
import { Button } from '@github-embed-ui/ui/components/button';
import { Code, Copy, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface EmbedCodeModalProps {
  widgetId: string;
  open: boolean;
  onClose: () => void;
}

type Tab = 'script' | 'npm';

export function EmbedCodeModal({ widgetId, open, onClose }: EmbedCodeModalProps) {
  const [tab, setTab] = useState<Tab>('script');
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const codes = {
    script: `<script async src="${baseUrl}/widget.js" data-widget-id="${widgetId}"></script>`,
    npm: `import { mount } from '@github-embed-ui/widget';\nmount('#my-widget', { widgetId: '${widgetId}', baseUrl: '${baseUrl}' });`,
  };

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(codes[tab]);
    setCopied(true);
    toast.success('Embed code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }, [codes, tab]);

  if (!open) return null;

  const tabs: { key: Tab; label: string; description: string }[] = [
    {
      key: 'script',
      label: 'Script Tag',
      description:
        'Shadow DOM widget. Paste anywhere — styles are fully isolated from your site. Only 9.6KB gzipped.',
    },
    {
      key: 'npm',
      label: 'npm Package',
      description:
        'Install @github-embed-ui/widget and mount programmatically. Preact as peer dependency.',
    },
  ];

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
          {tabs.map((t) => (
            <Button
              key={t.key}
              variant={tab === t.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </Button>
          ))}
        </div>

        <div className="mt-3">
          <pre className="bg-muted max-h-40 overflow-auto rounded-lg p-3 text-xs">
            <code>{codes[tab]}</code>
          </pre>
        </div>

        <div className="mt-3">
          <Button size="sm" className="gap-1.5" onClick={copyCode}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
        </div>

        <p className="text-muted-foreground mt-3 text-xs">
          {tabs.find((t) => t.key === tab)?.description}
        </p>
      </div>
    </div>
  );
}
