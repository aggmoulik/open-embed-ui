'use client';

import { useState, useCallback } from 'react';
import { Button } from './button';
import { Copy, Check } from 'lucide-react';

interface CodeSnippetProps {
  code: string;
  label?: string;
}

export function CodeSnippet({ code, label }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div>
      {label && <div className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</div>}
      <div className="relative">
        <pre className="overflow-auto rounded-lg bg-muted p-3 pr-16 text-xs">
          <code>{code}</code>
        </pre>
        <Button
          variant="ghost"
          size="xs"
          className="absolute right-2 top-2 gap-1"
          onClick={copy}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  );
}
