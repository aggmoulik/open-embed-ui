import { PRCard } from '../components/PRCard';
import type { Contribution } from '../types';

interface Props {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function MarqueeLayout({ contributions, titleOverrides }: Props) {
  if (contributions.length === 0) return <div class="geu-empty">No contributions to display</div>;

  return (
    <div class="geu-marquee">
      <div class="geu-marquee-track">
        {contributions.map((c) => (
          <div class="geu-marquee-item">
            <PRCard key={c.id} contribution={c} titleOverride={titleOverrides?.[c.id]} />
          </div>
        ))}
        {contributions.map((c) => (
          <div class="geu-marquee-item">
            <PRCard key={`dup-${c.id}`} contribution={c} titleOverride={titleOverrides?.[c.id]} />
          </div>
        ))}
      </div>
    </div>
  );
}
