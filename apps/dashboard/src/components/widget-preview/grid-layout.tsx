import { PRCard } from './pr-card';
import type { Contribution } from '@/types';

interface GridLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function GridLayout({ contributions, titleOverrides }: GridLayoutProps) {
  if (contributions.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {contributions.map((c) => (
        <PRCard key={c.id} contribution={c} titleOverride={titleOverrides?.[c.id]} uniform />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border-border bg-muted/20 text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center font-mono text-[12px]">
      <span className="text-brand">●</span>
      <span className="mt-1.5">No contributions match these filters.</span>
    </div>
  );
}
