import { getDisplayLabels, getLabelColor, getCleanTitle } from '../labels';
import type { Contribution } from '../types';
import { safeHref } from '../lib/url-safe';

interface Props {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

/**
 * Scorecard layout — stats banner + compact 2-column card grid.
 *
 * Part of the "receipt family" alongside TerminalLayout and LogLayout.
 * Large hero contribution count on the left, three secondary stats on the
 * right, followed by a responsive card grid showing each PR with kind pill,
 * date, title, repo, and a proportional diff bar.
 */
export function ScorecardLayout({ contributions, titleOverrides }: Props) {
  if (contributions.length === 0) {
    return <div class="geu-empty">No contributions to display</div>;
  }

  const totalAdd = contributions.reduce((n, c) => n + c.additions, 0);
  const totalDel = contributions.reduce((n, c) => n + c.deletions, 0);
  const repoCount = new Set(contributions.map((c) => c.repo)).size;

  return (
    <div class="geu-scorecard">
      <header class="geu-scorecard-banner">
        <div class="geu-scorecard-hero">
          <span class="geu-scorecard-hero-value">{formatNumber(contributions.length)}</span>
          <span class="geu-scorecard-hero-label">contributions shipped</span>
        </div>
        <div class="geu-scorecard-stats">
          <div class="geu-scorecard-stat">
            <span class="geu-scorecard-stat-value geu-scorecard-add">+{formatNumber(totalAdd)}</span>
            <span class="geu-scorecard-stat-label">added</span>
          </div>
          <div class="geu-scorecard-stat">
            <span class="geu-scorecard-stat-value geu-scorecard-del">-{formatNumber(totalDel)}</span>
            <span class="geu-scorecard-stat-label">removed</span>
          </div>
          <div class="geu-scorecard-stat">
            <span class="geu-scorecard-stat-value">{formatNumber(repoCount)}</span>
            <span class="geu-scorecard-stat-label">repos</span>
          </div>
        </div>
      </header>

      <div class="geu-scorecard-grid">
        {contributions.map((c) => {
          const title = c.titleOverride || titleOverrides?.[c.id] || c.title;
          const labels = getDisplayLabels(title, c.labels);
          const cleanTitle = getCleanTitle(title, c.labels);
          const total = c.additions + c.deletions;
          const addPct = total === 0 ? 50 : (c.additions / total) * 100;
          const delPct = 100 - addPct;

          return (
            <div key={c.id} class="geu-scorecard-card">
              <div class="geu-scorecard-card-top">
                <div style={{ display: 'flex', gap: '4px' }}>
                  {labels.map((label) => {
                    const color = getLabelColor(label);
                    return (
                      <span
                        key={label}
                        class="geu-scorecard-kind"
                        data-lbl
                        style={{
                          '--lbl-light': color.light,
                          '--lbl-dark': color.dark,
                        }}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
                {c.mergedAt && (
                  <time class="geu-scorecard-date" dateTime={c.mergedAt}>
                    {shortDate(c.mergedAt)}
                  </time>
                )}
              </div>
              <a
                href={safeHref(c.url)}
                target="_blank"
                rel="noopener noreferrer"
                class="geu-scorecard-title"
                title={title}
              >
                {cleanTitle}
              </a>
              <a
                href={safeHref(`https://github.com/${c.repo}`)}
                target="_blank"
                rel="noopener noreferrer"
                class="geu-scorecard-repo"
              >
                {c.repo}
              </a>
              <div class="geu-scorecard-diff">
                <div class="geu-scorecard-diff-bar">
                  <div
                    class="geu-scorecard-diff-add-seg"
                    style={{ width: `${addPct}%` }}
                  />
                  <div
                    class="geu-scorecard-diff-del-seg"
                    style={{ width: `${delPct}%` }}
                  />
                </div>
                <span class="geu-scorecard-diff-nums">
                  <span class="geu-scorecard-add">+{c.additions}</span>
                  <span class="geu-scorecard-del">-{c.deletions}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- helpers ---------------------------------------------------------------

function shortDate(iso: string): string {
  const d = new Date(iso);
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}
