import { PRCard } from './pr-card';
import type { Contribution } from '@/types';

interface ListLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function ListLayout({ contributions, titleOverrides }: ListLayoutProps) {
  if (contributions.length === 0) return <EmptyState />;

  return (
    <div className="space-y-2.5">
      {contributions.map((c) => (
        <PRCard key={c.id} contribution={c} compact titleOverride={titleOverrides?.[c.id]} />
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
