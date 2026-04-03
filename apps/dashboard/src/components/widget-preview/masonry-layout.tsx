import { PRCard } from './pr-card';
import type { Contribution } from '@/types';

interface MasonryLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function MasonryLayout({ contributions, titleOverrides }: MasonryLayoutProps) {
  if (contributions.length === 0) return <EmptyState />;

  return (
    <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
      {contributions.map((c) => (
        <div key={c.id} className="mb-3 break-inside-avoid">
          <PRCard contribution={c} titleOverride={titleOverrides?.[c.id]} />
        </div>
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
