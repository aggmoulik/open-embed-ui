import { PRCard } from './pr-card';
import type { Contribution } from '@/types';

interface GridLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function GridLayout({ contributions, titleOverrides }: GridLayoutProps) {
  if (contributions.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {contributions.map((c) => (
        <PRCard key={c.id} contribution={c} titleOverride={titleOverrides?.[c.id]} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
      No contributions match these filters.
    </div>
  );
}
