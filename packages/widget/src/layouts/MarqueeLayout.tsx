import { PRCard } from '../components/PRCard';
import type { Contribution } from '../types';

interface Props {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function MarqueeLayout({ contributions, titleOverrides }: Props) {
  if (contributions.length === 0) return <div class="geu-empty">No contributions to display</div>;

  // Split contributions into two rows
  const mid = Math.ceil(contributions.length / 2);
  const topRow = contributions.slice(0, mid);
  const bottomRow = contributions.slice(mid);

  return (
    <div class="geu-marquee">
      <div class="geu-marquee-row">
        <div class="geu-marquee-track">
          {topRow.map((c) => (
            <div class="geu-marquee-item">
              <PRCard key={c.id} contribution={c} titleOverride={titleOverrides?.[c.id]} />
            </div>
          ))}
          {topRow.map((c) => (
            <div class="geu-marquee-item">
              <PRCard key={`dup-${c.id}`} contribution={c} titleOverride={titleOverrides?.[c.id]} />
            </div>
          ))}
        </div>
      </div>
      {bottomRow.length > 0 && (
        <div class="geu-marquee-row">
          <div class="geu-marquee-track geu-marquee-track-reverse">
            {bottomRow.map((c) => (
              <div class="geu-marquee-item">
                <PRCard key={c.id} contribution={c} titleOverride={titleOverrides?.[c.id]} />
              </div>
            ))}
            {bottomRow.map((c) => (
              <div class="geu-marquee-item">
                <PRCard key={`dup-${c.id}`} contribution={c} titleOverride={titleOverrides?.[c.id]} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
