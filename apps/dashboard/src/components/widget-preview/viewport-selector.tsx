'use client';

import { Button } from '@github-embed-ui/ui/components/button';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

export type Viewport = 'desktop' | 'tablet' | 'mobile';

const viewports: { value: Viewport; label: string; icon: typeof Monitor; width: string }[] = [
  { value: 'desktop', label: 'Desktop', icon: Monitor, width: '100%' },
  { value: 'tablet', label: 'Tablet', icon: Tablet, width: '768px' },
  { value: 'mobile', label: 'Mobile', icon: Smartphone, width: '375px' },
];

interface ViewportSelectorProps {
  value: Viewport;
  onChange: (v: Viewport) => void;
}

export function ViewportSelector({ value, onChange }: ViewportSelectorProps) {
  return (
    <div className="flex gap-1">
      {viewports.map((v) => (
        <Button
          key={v.value}
          variant={value === v.value ? 'default' : 'outline'}
          size="icon-sm"
          onClick={() => onChange(v.value)}
          title={v.label}
        >
          <v.icon className="size-3.5" />
        </Button>
      ))}
    </div>
  );
}

export function getViewportWidth(viewport: Viewport): string {
  return viewports.find((v) => v.value === viewport)?.width ?? '100%';
}
