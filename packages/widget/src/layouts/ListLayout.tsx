import { PRCard } from '../components/PRCard';
import type { Contribution } from '../types';

interface Props {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function ListLayout({ contributions, titleOverrides }: Props) {
  if (contributions.length === 0) return <div class="geu-empty">No contributions to display</div>;

  return (
    <div class="geu-list">
      {contributions.map((c) => (
        <PRCard key={c.id} contribution={c} titleOverride={titleOverrides?.[c.id]} compact />
      ))}
    </div>
  );
}
