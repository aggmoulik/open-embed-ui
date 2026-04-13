import { getDisplayLabels, getLabelColor, getCleanTitle } from '@github-embed-ui/types';
import type { Contribution } from '@/types';

interface LogLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

/**
 * Dashboard preview mirror of `packages/widget/src/layouts/LogLayout.tsx`.
 *
 * Compact `git log --oneline` inspired view. Single line per PR with a 4-stat
 * header. Part of the "receipt family" alongside TerminalLayout and
 * ScorecardLayout. Uses the same `geu-log-*` class names so the CSS from
 * widget.css can be reused.
 */
export function LogLayout({ contributions, titleOverrides }: LogLayoutProps) {
  if (contributions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        No contributions match these filters.
      </div>
    );
  }

  const totalAdd = contributions.reduce((n, c) => n + c.additions, 0);
  const totalDel = contributions.reduce((n, c) => n + c.deletions, 0);
  const repoCount = new Set(contributions.map((c) => c.repo)).size;

  return (
    <div className="geu-log">
      <header className="geu-log-header">
        <div className="geu-log-stat">
          <span className="geu-log-stat-value">{formatNumber(contributions.length)}</span>
          <span className="geu-log-stat-label">MERGED</span>
        </div>
        <div className="geu-log-stat">
          <span className="geu-log-stat-value">{formatNumber(repoCount)}</span>
          <span className="geu-log-stat-label">REPOS</span>
        </div>
        <div className="geu-log-stat">
          <span className="geu-log-stat-value geu-log-add">+{formatNumber(totalAdd)}</span>
          <span className="geu-log-stat-label">ADDED</span>
        </div>
        <div className="geu-log-stat">
          <span className="geu-log-stat-value geu-log-del">-{formatNumber(totalDel)}</span>
          <span className="geu-log-stat-label">REMOVED</span>
        </div>
      </header>

      <ul className="geu-log-list">
        {contributions.map((c) => {
          const title = titleOverrides?.[c.id] || c.title;
          const labels = getDisplayLabels(title, c.labels);
          const cleanTitle = getCleanTitle(title, c.labels);
          const hash = shortHash(c.id);

          return (
            <li key={c.id} className="geu-log-row">
              <span className="geu-log-hash">#{hash}</span>
              {labels.map((label) => {
                const color = getLabelColor(label);
                return (
                  <span
                    key={label}
                    className="geu-log-kind"
                    data-lbl
                    style={{
                      '--lbl-light': color.light,
                      '--lbl-dark': color.dark,
                    } as React.CSSProperties}
                  >
                    {label}
                  </span>
                );
              })}
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="geu-log-title"
                title={title}
              >
                {cleanTitle}
              </a>
              <a
                href={`https://github.com/${c.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="geu-log-repo"
              >
                {c.repo}
              </a>
              <span className="geu-log-add">+{c.additions}</span>
              <span className="geu-log-del">-{c.deletions}</span>
              {c.mergedAt && (
                <time className="geu-log-date" dateTime={new Date(c.mergedAt).toISOString()}>
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

// --- helpers (mirrors packages/widget/src/layouts/LogLayout.tsx) -----------

function shortHash(id: string): string {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
}

function shortDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const MONTHS = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}
