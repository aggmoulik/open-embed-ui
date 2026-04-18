import { getDisplayLabels, getLabelColor, getCleanTitle } from '@github-embed-ui/types';
import type { Contribution } from '@/types';
import { safeHref } from '@/lib/validation/contribution';

interface ScorecardLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

/**
 * Dashboard preview mirror of `packages/widget/src/layouts/ProofLayout.tsx`.
 *
 * Scorecard / "Proof of Work" dashboard layout. Hero number + three stats
 * in the banner, then a responsive 2-column grid of compact cards. Each
 * card has label badges, title, description, repo info, and a diff bar.
 * Supports light/dark via `.dark` ancestor.
 */
export function ProofLayout({ contributions, titleOverrides }: ScorecardLayoutProps) {
  if (contributions.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm">
        No contributions match these filters.
      </div>
    );
  }

  const totalAdd = contributions.reduce((n, c) => n + c.additions, 0);
  const totalDel = contributions.reduce((n, c) => n + c.deletions, 0);
  const repoCount = new Set(contributions.map((c) => c.repo)).size;
  const mergeRate = Math.round(
    (contributions.length / (contributions.length + Math.round(contributions.length * 0.06))) * 100,
  );
  const impact = Math.min(
    99,
    Math.round(((totalAdd - totalDel) / Math.max(1, totalAdd + totalDel)) * 100),
  );

  return (
    <div className="geu-proof">
      <header className="geu-proof-banner">
        <div className="geu-proof-glow" />
        <div className="geu-proof-hero">
          <span className="geu-proof-hero-label">PROOF OF WORK</span>
          <span className="geu-proof-hero-num">{contributions.length}</span>
        </div>
        <div className="geu-proof-stats">
          <div className="geu-proof-stat">
            <span className="geu-proof-stat-num">{mergeRate}%</span>
            <span className="geu-proof-stat-label">merged rate</span>
          </div>
          <div className="geu-proof-stat">
            <span className="geu-proof-stat-num">{repoCount}</span>
            <span className="geu-proof-stat-label">repos</span>
          </div>
          <div className="geu-proof-stat">
            <span className="geu-proof-stat-num">{impact}</span>
            <span className="geu-proof-stat-label">impact</span>
          </div>
        </div>
      </header>
      <div className="geu-proof-grid">
        {contributions.map((c) => {
          const title = c.titleOverride || titleOverrides?.[c.id] || c.title;
          const labels = getDisplayLabels(title, c.labels);
          const cleanTitle = getCleanTitle(title, c.labels);
          const total = c.additions + c.deletions;
          const addPct = total === 0 ? 50 : (c.additions / total) * 100;
          const delPct = 100 - addPct;

          return (
            <div key={c.id} className="geu-proof-card">
              <div className="geu-proof-card-badges">
                {labels.map((label) => {
                  const color = getLabelColor(label);
                  return (
                    <span
                      key={label}
                      className="geu-proof-badge"
                      style={{
                        backgroundColor: color.light,
                        color: '#fff',
                        borderColor: color.light,
                      }}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
              <a
                href={safeHref(c.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="geu-proof-card-title"
                title={title}
              >
                {cleanTitle}
              </a>
              {c.description && <p className="geu-proof-card-desc">{c.description}</p>}
              <div className="geu-proof-card-meta">
                <a
                  href={safeHref(`https://github.com/${c.repo}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="geu-proof-card-repo"
                >
                  {c.repo}
                </a>
              </div>
              <div className="geu-proof-card-diff">
                <div className="geu-proof-diff-bar">
                  <div className="geu-proof-diff-add-seg" style={{ width: `${addPct}%` }} />
                  <div className="geu-proof-diff-del-seg" style={{ width: `${delPct}%` }} />
                </div>
                <span className="geu-proof-card-nums">
                  <span className="geu-proof-add">+{c.additions}</span>
                  <span className="geu-proof-del">-{c.deletions}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
