import {
  getBlogTarget,
  getDisplayLabels,
  getLabelColor,
  getCleanTitle,
} from '@open-embed-ui/types';
import type { Contribution } from '@/types';
import { safeHref } from '@/lib/validation/contribution';

interface TerminalLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

/**
 * Dashboard preview mirror of `packages/widget/src/layouts/GitlogLayout.tsx`.
 *
 * CLI git-log layout. Renders merged PRs as terminal output of
 * `git log --merged --oneline`. Header with command + stats line, then
 * entries with colored kind-dot, hash, title, and description.
 * Supports light/dark via `.dark` ancestor.
 */
export function GitlogLayout({ contributions, titleOverrides }: TerminalLayoutProps) {
  if (contributions.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm">
        No contributions match these filters.
      </div>
    );
  }

  // Real aggregate stats (merged from the old `log` layout when it was
  // dropped in feature 17). The previous fluff stats — `rate` (just the
  // count inflated by 6%) and `impact` (the +/- ratio) — were made-up
  // derived numbers, not real data; replaced with actual count + repos +
  // total additions/deletions.
  const totalAdd = contributions.reduce((n, c) => n + c.additions, 0);
  const totalDel = contributions.reduce((n, c) => n + c.deletions, 0);
  const repoCount = new Set(contributions.map((c) => c.repo)).size;

  return (
    <div className="geu-gitlog">
      <div className="geu-gitlog-cmd">
        <span className="geu-gitlog-prompt">$</span>{' '}
        <span className="geu-gitlog-cmd-text">git log --author=contributor --merged --oneline</span>
      </div>
      <div className="geu-gitlog-stats-row">
        <span className="geu-gitlog-stats-item">
          <span className="geu-gitlog-stats-label">merged:</span>{' '}
          <span className="geu-gitlog-stats-val">{contributions.length}</span>
        </span>
        <span className="geu-gitlog-stats-item">
          <span className="geu-gitlog-stats-label">repos:</span>{' '}
          <span className="geu-gitlog-stats-val">{repoCount}</span>
        </span>
        <span className="geu-gitlog-stats-item">
          <span className="geu-gitlog-stats-label">+</span>
          <span className="geu-gitlog-stats-val">{totalAdd.toLocaleString('en-US')}</span>
        </span>
        <span className="geu-gitlog-stats-item">
          <span className="geu-gitlog-stats-label">-</span>
          <span className="geu-gitlog-stats-val">{totalDel.toLocaleString('en-US')}</span>
        </span>
      </div>
      <div className="geu-gitlog-entries">
        {contributions.map((c) => {
          const title = c.titleOverride || titleOverrides?.[c.id] || c.title;
          const labels = getDisplayLabels(title, c.labels);
          const cleanTitle = getCleanTitle(title, c.labels);
          const hash = shortHash(c.id);
          const dotColor = getLabelColor(labels[0]);

          return (
            <div key={c.id} className="geu-gitlog-entry">
              <div className="geu-gitlog-entry-main">
                <span
                  className="geu-gitlog-dot"
                  style={{
                    background: dotColor.light,
                  }}
                />
                <span className="geu-gitlog-hash">{hash}</span>
                <a
                  href={safeHref(c.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="geu-gitlog-title"
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
                      style={{
                        marginLeft: '6px',
                        color: 'currentColor',
                        opacity: 0.55,
                        fontSize: '10px',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      }}
                      title="Read blog post"
                    >
                      [blog↗]
                    </a>
                  );
                })()}
              </div>
              {c.description && <div className="geu-gitlog-desc">{c.description}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- helpers (mirrors packages/widget/src/layouts/GitlogLayout.tsx) ----

function shortHash(id: string): string {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 6);
}
