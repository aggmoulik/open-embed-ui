/**
 * MarqueeLayout — SPECIAL CASE: uses raw CSS class names, not Tailwind utilities.
 *
 * Why: the marquee animates via @keyframes, which Tailwind doesn't model
 * ergonomically as a utility class. Each consumer owns its own keyframe
 * definitions and reuses them under the shared .geu-* class names:
 *   - apps/dashboard/src/app/globals.css  → @keyframes marquee / marquee-reverse
 *   - packages/widget/src/styles/widget.css → @keyframes geu-marquee / geu-marquee-reverse
 *
 * The keyframe NAMES differ between consumers (intentional, to avoid colliding
 * with each consumer's existing CSS); only the class names .geu-marquee*
 * are shared. Both consumers MUST define:
 *   - .geu-marquee                          (container, sets overflow hidden)
 *   - .geu-marquee-row                      (per-row clipper)
 *   - .geu-marquee-track                    (animated track, runs forward)
 *   - .geu-marquee-track-reverse            (reverse variant — applied on bottom row)
 *   - .geu-marquee:hover .geu-marquee-track (pause-on-hover)
 *   - .geu-marquee-item                     (per-card slot, 280px fixed)
 *
 * The widget's `geu-` naming was chosen over the dashboard's `animate-marquee`
 * because the widget's convention is richer (5 classes vs 2) — porting it to
 * the dashboard was a smaller CSS delta than the reverse direction.
 */
import { PRCard } from '../PRCard';
import type { BaseContribution as Contribution } from '@open-embed-ui/types';

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
    <div className="geu-marquee">
      <div className="geu-marquee-row">
        <div className="geu-marquee-track">
          {topRow.map((c) => (
            <div key={c.id} className="geu-marquee-item">
              <PRCard contribution={c} titleOverride={titleOverrides?.[c.id]} uniform />
            </div>
          ))}
          {topRow.map((c) => (
            <div key={`dup-${c.id}`} className="geu-marquee-item">
              <PRCard contribution={c} titleOverride={titleOverrides?.[c.id]} uniform />
            </div>
          ))}
        </div>
      </div>
      {bottomRow.length > 0 && (
        <div className="geu-marquee-row">
          <div className="geu-marquee-track geu-marquee-track-reverse">
            {bottomRow.map((c) => (
              <div key={c.id} className="geu-marquee-item">
                <PRCard contribution={c} titleOverride={titleOverrides?.[c.id]} uniform />
              </div>
            ))}
            {bottomRow.map((c) => (
              <div key={`dup-${c.id}`} className="geu-marquee-item">
                <PRCard contribution={c} titleOverride={titleOverrides?.[c.id]} uniform />
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
    <div className="border-border bg-muted/20 text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center font-mono text-[12px]">
      <span className="text-brand">●</span>
      <span className="mt-1.5">No contributions match these filters.</span>
    </div>
  );
}
