import { getDisplayLabels, getLabelColor, getCleanTitle } from '@github-embed-ui/types';
import type { Contribution } from '@/types';

interface ScorecardLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

/**
 * Dashboard preview mirror of `packages/widget/src/layouts/ScorecardLayout.tsx`.
 *
 * Stats banner + compact 2-column card grid. Part of the "receipt family"
 * alongside TerminalLayout and LogLayout. Uses the same `geu-scorecard-*`
 * class names so the CSS from widget.css can be reused.
 */
export function ScorecardLayout({ contributions, titleOverrides }: ScorecardLayoutProps) {
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

  return (
    <div className="geu-scorecard">
      <header className="geu-scorecard-banner">
        <div className="geu-scorecard-hero">
          <span className="geu-scorecard-hero-value">{formatNumber(contributions.length)}</span>
          <span className="geu-scorecard-hero-label">contributions shipped</span>
        </div>
        <div className="geu-scorecard-stats">
          <div className="geu-scorecard-stat">
            <span className="geu-scorecard-stat-value geu-scorecard-add">
              +{formatNumber(totalAdd)}
            </span>
            <span className="geu-scorecard-stat-label">added</span>
          </div>
          <div className="geu-scorecard-stat">
            <span className="geu-scorecard-stat-value geu-scorecard-del">
              -{formatNumber(totalDel)}
            </span>
            <span className="geu-scorecard-stat-label">removed</span>
          </div>
          <div className="geu-scorecard-stat">
            <span className="geu-scorecard-stat-value">{formatNumber(repoCount)}</span>
            <span className="geu-scorecard-stat-label">repos</span>
          </div>
        </div>
      </header>

      <div className="geu-scorecard-grid">
        {contributions.map((c) => {
          const title = c.titleOverride || titleOverrides?.[c.id] || c.title;
          const labels = getDisplayLabels(title, c.labels);
          const cleanTitle = getCleanTitle(title, c.labels);
          const total = c.additions + c.deletions;
          const addPct = total === 0 ? 50 : (c.additions / total) * 100;
          const delPct = 100 - addPct;

          return (
            <div key={c.id} className="geu-scorecard-card">
              <div className="geu-scorecard-card-top">
                <div style={{ display: 'flex', gap: '4px' }}>
                  {labels.map((label) => {
                    const color = getLabelColor(label);
                    return (
                      <span
                        key={label}
                        className="geu-scorecard-kind"
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
                {c.mergedAt && (
                  <time
                    className="geu-scorecard-date"
                    dateTime={new Date(c.mergedAt).toISOString()}
                  >
                    {shortDate(c.mergedAt)}
                  </time>
                )}
              </div>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="geu-scorecard-title"
                title={title}
              >
                {cleanTitle}
              </a>
              <a
                href={`https://github.com/${c.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="geu-scorecard-repo"
              >
                {c.repo}
              </a>
              <div className="geu-scorecard-diff">
                <div className="geu-scorecard-diff-bar">
                  <div className="geu-scorecard-diff-add-seg" style={{ width: `${addPct}%` }} />
                  <div className="geu-scorecard-diff-del-seg" style={{ width: `${delPct}%` }} />
                </div>
                <span className="geu-scorecard-diff-nums">
                  <span className="geu-scorecard-add">+{c.additions}</span>
                  <span className="geu-scorecard-del">-{c.deletions}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- helpers (mirrors packages/widget/src/layouts/ScorecardLayout.tsx) -----

function shortDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const MONTHS = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}
