import { getDisplayLabels, getLabelColor, getCleanTitle } from '../labels';
import type { Contribution } from '../types';
import { safeHref } from '../lib/url-safe';

interface Props {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

/**
 * Log layout — `git log --oneline` inspired.
 *
 * Compact single-line-per-PR flat list with a 4-stat header row. Part of the
 * "receipt family" alongside TerminalLayout and ScorecardLayout. Monospace,
 * dense, information-first.
 */
export function LogLayout({ contributions, titleOverrides }: Props) {
  if (contributions.length === 0) {
    return <div class="geu-empty">No contributions to display</div>;
  }

  const totalAdd = contributions.reduce((n, c) => n + c.additions, 0);
  const totalDel = contributions.reduce((n, c) => n + c.deletions, 0);
  const repoCount = new Set(contributions.map((c) => c.repo)).size;

  return (
    <div class="geu-log">
      <header class="geu-log-header">
        <div class="geu-log-stat">
          <span class="geu-log-stat-value">{formatNumber(contributions.length)}</span>
          <span class="geu-log-stat-label">MERGED</span>
        </div>
        <div class="geu-log-stat">
          <span class="geu-log-stat-value">{formatNumber(repoCount)}</span>
          <span class="geu-log-stat-label">REPOS</span>
        </div>
        <div class="geu-log-stat">
          <span class="geu-log-stat-value geu-log-add">+{formatNumber(totalAdd)}</span>
          <span class="geu-log-stat-label">ADDED</span>
        </div>
        <div class="geu-log-stat">
          <span class="geu-log-stat-value geu-log-del">-{formatNumber(totalDel)}</span>
          <span class="geu-log-stat-label">REMOVED</span>
        </div>
      </header>

      <ul class="geu-log-list">
        {contributions.map((c) => {
          const title = c.titleOverride || titleOverrides?.[c.id] || c.title;
          const labels = getDisplayLabels(title, c.labels);
          const cleanTitle = getCleanTitle(title, c.labels);
          const hash = shortHash(c.id);

          return (
            <li key={c.id} class="geu-log-row">
              <span class="geu-log-hash">#{hash}</span>
              {labels.map((label) => {
                const color = getLabelColor(label);
                return (
                  <span
                    key={label}
                    class="geu-log-kind"
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
              <a
                href={safeHref(c.url)}
                target="_blank"
                rel="noopener noreferrer"
                class="geu-log-title"
                title={title}
              >
                {cleanTitle}
              </a>
              <a
                href={safeHref(`https://github.com/${c.repo}`)}
                target="_blank"
                rel="noopener noreferrer"
                class="geu-log-repo"
              >
                {c.repo}
              </a>
              <span class="geu-log-add">+{c.additions}</span>
              <span class="geu-log-del">-{c.deletions}</span>
              {c.mergedAt && (
                <time class="geu-log-date" dateTime={c.mergedAt}>
                  {shortDate(c.mergedAt)}
                </time>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// --- helpers ---------------------------------------------------------------

function shortHash(id: string): string {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}
