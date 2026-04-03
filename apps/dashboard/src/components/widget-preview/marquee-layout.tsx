import { PRCard } from './pr-card';
import type { Contribution } from '@/types';

interface MarqueeLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function MarqueeLayout({ contributions, titleOverrides }: MarqueeLayoutProps) {
  if (contributions.length === 0) return <EmptyState />;

  return (
    <div className="overflow-hidden">
      <div className="flex gap-3">
        {contributions.map((c) => (
          <div key={c.id} className="w-[280px] shrink-0">
            <PRCard contribution={c} titleOverride={titleOverrides?.[c.id]} />
          </div>
        ))}
      </div>
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
