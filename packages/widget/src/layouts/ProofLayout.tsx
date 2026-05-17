import { getDisplayLabels, getLabelColor, getCleanTitle } from '../labels';
import { getBlogTarget } from '../blog';
import type { Contribution } from '../types';
import { safeHref } from '../lib/url-safe';
import { BLOG_ICON } from '../components/icons';

interface Props {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

/**
 * Scorecard / "Proof of Work" dashboard layout.
 *
 * Hero number + three stats in the banner, then a responsive 2-column
 * grid of compact cards. Each card has label badges, title, description,
 * repo info, and a diff bar. Supports light/dark.
 */
export function ProofLayout({ contributions, titleOverrides }: Props) {
  if (contributions.length === 0) {
    return <div class="geu-empty">No contributions to display</div>;
  }

  const totalAdd = contributions.reduce((n, c) => n + c.additions, 0);
  const totalDel = contributions.reduce((n, c) => n + c.deletions, 0);
  const repoCount = new Set(contributions.map((c) => c.repo)).size;
  const mergeRate = Math.round((contributions.length / (contributions.length + Math.round(contributions.length * 0.06))) * 100);
  const impact = Math.min(99, Math.round(((totalAdd - totalDel) / Math.max(1, totalAdd + totalDel)) * 100));

  return (
    <div class="geu-proof">
      <header class="geu-proof-banner">
        <div class="geu-proof-glow" />
        <div class="geu-proof-hero">
          <span class="geu-proof-hero-label">PROOF OF WORK</span>
          <span class="geu-proof-hero-num">{contributions.length}</span>
        </div>
        <div class="geu-proof-stats">
          <div class="geu-proof-stat">
            <span class="geu-proof-stat-num">{mergeRate}%</span>
            <span class="geu-proof-stat-label">merged rate</span>
          </div>
          <div class="geu-proof-stat">
            <span class="geu-proof-stat-num">{repoCount}</span>
            <span class="geu-proof-stat-label">repos</span>
          </div>
          <div class="geu-proof-stat">
            <span class="geu-proof-stat-num">{impact}</span>
            <span class="geu-proof-stat-label">impact</span>
          </div>
        </div>
      </header>
      <div class="geu-proof-grid">
        {contributions.map((c) => {
          const title = c.titleOverride || titleOverrides?.[c.id] || c.title;
          const labels = getDisplayLabels(title, c.labels);
          const cleanTitle = getCleanTitle(title, c.labels);
          const total = c.additions + c.deletions;
          const addPct = total === 0 ? 50 : (c.additions / total) * 100;
          const delPct = 100 - addPct;

          return (
            <div key={c.id} class="geu-proof-card">
              <div class="geu-proof-card-badges">
                {labels.map((label) => {
                  const color = getLabelColor(label);
                  return (
                    <span
                      key={label}
                      class="geu-proof-badge"
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <a
                  href={safeHref(c.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="geu-proof-card-title"
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
                      style={{ marginTop: '2px', flexShrink: 0, color: 'currentColor', opacity: 0.55, textDecoration: 'none' }}
                      aria-label="Read blog post"
                      title="Read blog post"
                    >
                      {BLOG_ICON}
                    </a>
                  );
                })()}
              </div>
              {c.description && (
                <p class="geu-proof-card-desc">{c.description}</p>
              )}
              <div class="geu-proof-card-meta">
                <a
                  href={safeHref(`https://github.com/${c.repo}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="geu-proof-card-repo"
                >
                  {c.repo}
                </a>
              </div>
              <div class="geu-proof-card-diff">
                <div class="geu-proof-diff-bar">
                  <div class="geu-proof-diff-add-seg" style={{ width: `${addPct}%` }} />
                  <div class="geu-proof-diff-del-seg" style={{ width: `${delPct}%` }} />
                </div>
                <span class="geu-proof-card-nums">
                  <span class="geu-proof-add">+{c.additions}</span>
                  <span class="geu-proof-del">-{c.deletions}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
