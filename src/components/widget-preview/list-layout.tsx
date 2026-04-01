import { PRCard } from './pr-card';
import type { Contribution } from '@/types';

interface ListLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function ListLayout({ contributions, titleOverrides }: ListLayoutProps) {
  if (contributions.length === 0) return <EmptyState />;

  return (
    <div className="space-y-2">
      {contributions.map((c) => (
        <PRCard key={c.id} contribution={c} compact titleOverride={titleOverrides?.[c.id]} />
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
