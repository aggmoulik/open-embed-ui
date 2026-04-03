import { PRCard } from './pr-card';
import type { Contribution } from '@/types';

interface MarqueeLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function MarqueeLayout({ contributions, titleOverrides }: MarqueeLayoutProps) {
  if (contributions.length === 0) return <EmptyState />;

  const mid = Math.ceil(contributions.length / 2);
  const topRow = contributions.slice(0, mid);
  const bottomRow = contributions.slice(mid);

  return (
    <div className="flex flex-col gap-3 overflow-hidden">
      <div className="overflow-hidden">
        <div className="animate-marquee flex flex-nowrap gap-3" style={{ width: 'max-content' }}>
          {topRow.map((c) => (
            <div key={c.id} className="w-[280px] flex-[0_0_280px]">
              <PRCard contribution={c} titleOverride={titleOverrides?.[c.id]} />
            </div>
          ))}
          {topRow.map((c) => (
            <div key={`dup-${c.id}`} className="w-[280px] flex-[0_0_280px]">
              <PRCard contribution={c} titleOverride={titleOverrides?.[c.id]} />
            </div>
          ))}
        </div>
      </div>
      {bottomRow.length > 0 && (
        <div className="overflow-hidden">
          <div
            className="animate-marquee-reverse flex flex-nowrap gap-3"
            style={{ width: 'max-content' }}
          >
            {bottomRow.map((c) => (
              <div key={c.id} className="w-[280px] flex-[0_0_280px]">
                <PRCard contribution={c} titleOverride={titleOverrides?.[c.id]} />
              </div>
            ))}
            {bottomRow.map((c) => (
              <div key={`dup-${c.id}`} className="w-[280px] flex-[0_0_280px]">
                <PRCard contribution={c} titleOverride={titleOverrides?.[c.id]} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm">
      No contributions match these filters.
    </div>
  );
}
