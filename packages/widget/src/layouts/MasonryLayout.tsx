import { PRCard } from '../components/PRCard';
import type { Contribution } from '../types';

interface Props {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function MasonryLayout({ contributions, titleOverrides }: Props) {
  if (contributions.length === 0) return <div class="geu-empty">No contributions to display</div>;

  return (
    <div class="geu-masonry">
      {contributions.map((c) => (
        <div class="geu-masonry-item" key={c.id}>
          <PRCard contribution={c} titleOverride={titleOverrides?.[c.id]} />
        </div>
      ))}
    </div>
  );
}
