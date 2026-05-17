import { BookOpen } from 'lucide-react';
import {
  getBlogTarget,
  getDisplayLabels,
  getLabelColor,
  getCleanTitle,
} from '@open-embed-ui/types';
import type { Contribution } from '@/types';
import { safeHref } from '@/lib/validation/contribution';

interface DevlogLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

/**
 * Dashboard preview mirror of `packages/widget/src/layouts/DevlogLayout.tsx`.
 *
 * Vertical timeline layout with diff bars. Thin vertical line on the left,
 * colored dots per entry, label badges, title, description, repo, and a
 * proportional green/red diff bar. Supports light/dark via `.dark` ancestor.
 */
export function DevlogLayout({ contributions, titleOverrides }: DevlogLayoutProps) {
  if (contributions.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm">
        No contributions match these filters.
      </div>
    );
  }

  return (
    <div className="geu-devlog">
      <div className="geu-devlog-line" />
      {contributions.map((c) => {
        const title = c.titleOverride || titleOverrides?.[c.id] || c.title;
        const labels = getDisplayLabels(title, c.labels);
        const cleanTitle = getCleanTitle(title, c.labels);
        const total = c.additions + c.deletions;
        const addPct = total === 0 ? 50 : (c.additions / total) * 100;
        const delPct = 100 - addPct;
        const dotColor = getLabelColor(labels[0]);

        return (
          <div key={c.id} className="geu-devlog-entry">
            <div
              className="geu-devlog-dot"
              style={{
                background: dotColor.light,
              }}
            />
            <div className="geu-devlog-content">
              <div className="geu-devlog-badges">
                {labels.map((label) => {
                  const color = getLabelColor(label);
                  return (
                    <span
                      key={label}
                      className="geu-devlog-badge"
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <a
                  href={safeHref(c.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="geu-devlog-title"
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
                        marginTop: '2px',
                        flexShrink: 0,
                        color: 'currentColor',
                        opacity: 0.55,
                        textDecoration: 'none',
                      }}
                      aria-label="Read blog post"
                      title="Read blog post"
                    >
                      <BookOpen size={13} />
                    </a>
                  );
                })()}
              </div>
              {c.description && <p className="geu-devlog-desc">{c.description}</p>}
              <div className="geu-devlog-meta">
                <a
                  href={safeHref(`https://github.com/${c.repo}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="geu-devlog-repo"
                >
                  {c.repo}
                </a>
              </div>
              <div className="geu-devlog-diff">
                <div className="geu-devlog-diff-bar">
                  <div className="geu-devlog-diff-add" style={{ width: `${addPct}%` }} />
                  <div className="geu-devlog-diff-del" style={{ width: `${delPct}%` }} />
                </div>
                <span className="geu-devlog-diff-nums">
                  <span className="geu-devlog-add">+{c.additions}</span>
                  <span className="geu-devlog-del">-{c.deletions}</span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
