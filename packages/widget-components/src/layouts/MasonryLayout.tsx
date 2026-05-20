import { PRCard } from '../PRCard';
import type { BaseContribution as Contribution } from '@open-embed-ui/types';

interface MasonryLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function MasonryLayout({ contributions, titleOverrides }: MasonryLayoutProps) {
  if (contributions.length === 0) return <EmptyState />;

  return (
    <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
      {contributions.map((c, i) => (
        <div key={c.id} className="mb-3 break-inside-avoid">
          <PRCard
            contribution={c}
            titleOverride={titleOverrides?.[c.id]}
            showDescription={i % 3 === 0}
          />
        </div>
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
