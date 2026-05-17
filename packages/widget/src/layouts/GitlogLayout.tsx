import { getDisplayLabels, getLabelColor, getCleanTitle } from '../labels';
import { getBlogTarget } from '../blog';
import type { Contribution } from '../types';
import { safeHref } from '../lib/url-safe';

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

  // Real aggregate stats (merged from the old `log` layout when it was
  // dropped in feature 17). Previously had fluff stats (`rate`, `impact`);
  // now shows actual count + repos + total additions/deletions.
  const totalAdd = contributions.reduce((n, c) => n + c.additions, 0);
  const totalDel = contributions.reduce((n, c) => n + c.deletions, 0);
  const repoCount = new Set(contributions.map((c) => c.repo)).size;

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
          <span class="geu-gitlog-stats-label">repos:</span>{' '}
          <span class="geu-gitlog-stats-val">{repoCount}</span>
        </span>
        <span class="geu-gitlog-stats-item">
          <span class="geu-gitlog-stats-label">+</span>
          <span class="geu-gitlog-stats-val">{totalAdd.toLocaleString('en-US')}</span>
        </span>
        <span class="geu-gitlog-stats-item">
          <span class="geu-gitlog-stats-label">-</span>
          <span class="geu-gitlog-stats-val">{totalDel.toLocaleString('en-US')}</span>
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
                  href={safeHref(c.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="geu-gitlog-title"
                  title={title}
                >
                  {cleanTitle}
                </a>
                {(() => {
                  const blog = getBlogTarget(c);
                  if (!blog) return null;
                  return (
                    <a
                      href={safeHref(blog.href)}
                      target={blog.target}
                      rel={blog.rel}
                      style={{ marginLeft: '6px', color: 'currentColor', opacity: 0.55, fontSize: '10px', textDecoration: 'none', whiteSpace: 'nowrap' }}
                      title="Read blog post"
                    >
                      [blog↗]
                    </a>
                  );
                })()}
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
