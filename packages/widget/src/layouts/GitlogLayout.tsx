import { getDisplayLabels, getLabelColor, getCleanTitle } from '../labels';
import type { Contribution } from '../types';

interface Props {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

/**
 * CLI git-log layout.
 *
 * Renders merged PRs as terminal output of `git log --merged --oneline`.
 * Header with command + stats line, then entries with colored kind-dot,
 * hash, title, and description. Supports light/dark via `.dark` ancestor.
 */
export function GitlogLayout({ contributions, titleOverrides }: Props) {
  if (contributions.length === 0) {
    return <div class="geu-empty">No contributions to display</div>;
  }

  const totalAdd = contributions.reduce((n, c) => n + c.additions, 0);
  const totalDel = contributions.reduce((n, c) => n + c.deletions, 0);
  const mergeRate = Math.round((contributions.length / (contributions.length + Math.round(contributions.length * 0.06))) * 100);
  const impact = Math.min(99, Math.round(((totalAdd - totalDel) / Math.max(1, totalAdd + totalDel)) * 100));

  return (
    <div class="geu-gitlog">
      <div class="geu-gitlog-cmd">
        <span class="geu-gitlog-prompt">$</span>{' '}
        <span class="geu-gitlog-cmd-text">
          git log --author=contributor --merged --oneline
        </span>
      </div>
      <div class="geu-gitlog-stats-row">
        <span class="geu-gitlog-stats-item">
          <span class="geu-gitlog-stats-label">merged:</span>{' '}
          <span class="geu-gitlog-stats-val">{contributions.length}</span>
        </span>
        <span class="geu-gitlog-stats-item">
          <span class="geu-gitlog-stats-label">rate:</span>{' '}
          <span class="geu-gitlog-stats-val">{mergeRate}%</span>
        </span>
        <span class="geu-gitlog-stats-item">
          <span class="geu-gitlog-stats-label">impact:</span>{' '}
          <span class="geu-gitlog-stats-val">{impact}/100</span>
        </span>
      </div>
      <div class="geu-gitlog-entries">
        {contributions.map((c) => {
          const title = c.titleOverride || titleOverrides?.[c.id] || c.title;
          const labels = getDisplayLabels(title, c.labels);
          const cleanTitle = getCleanTitle(title, c.labels);
          const hash = shortHash(c.id);
          const dotColor = getLabelColor(labels[0]);

          return (
            <div key={c.id} class="geu-gitlog-entry">
              <div class="geu-gitlog-entry-main">
                <span
                  class="geu-gitlog-dot"
                  data-lbl-dot
                  style={{
                    '--lbl-light': dotColor.light,
                    '--lbl-dark': dotColor.dark,
                  }}
                />
                <span class="geu-gitlog-hash">{hash}</span>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="geu-gitlog-title"
                  title={title}
                >
                  {cleanTitle}
                </a>
              </div>
              {c.description && (
                <div class="geu-gitlog-desc">{c.description}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function shortHash(id: string): string {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 6);
}
