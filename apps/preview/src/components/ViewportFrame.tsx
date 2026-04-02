import type { ComponentChildren } from 'preact';

const widths: Record<string, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

interface ViewportFrameProps {
  viewport: string;
  children: ComponentChildren;
}

export function ViewportFrame({ viewport, children }: ViewportFrameProps) {
  return (
    <div class="preview-canvas">
      <div class="viewport-frame" style={{ width: widths[viewport] ?? '100%', maxWidth: '100%' }}>
        {children}
      </div>
    </div>
  );
}
