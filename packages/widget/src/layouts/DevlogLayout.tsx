import { getDisplayLabels, getLabelColor, getCleanTitle } from '../labels';
import type { Contribution } from '../types';

interface Props {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

/**
 * Vertical timeline layout with diff bars.
 *
 * Thin vertical line on the left, colored dots per entry, label badges,
 * title, description, repo, and a proportional green/red diff bar.
 * Supports light/dark via `.dark` ancestor.
 */
export function DevlogLayout({ contributions, titleOverrides }: Props) {
  if (contributions.length === 0) {
    return <div class="geu-empty">No contributions to display</div>;
  }

  return (
    <div class="geu-devlog">
      <div class="geu-devlog-line" />
      {contributions.map((c) => {
        const title = c.titleOverride || titleOverrides?.[c.id] || c.title;
        const labels = getDisplayLabels(title, c.labels);
        const cleanTitle = getCleanTitle(title, c.labels);
        const total = c.additions + c.deletions;
        const addPct = total === 0 ? 50 : (c.additions / total) * 100;
        const delPct = 100 - addPct;
        const dotColor = getLabelColor(labels[0]);

        return (
          <div key={c.id} class="geu-devlog-entry">
            <div
              class="geu-devlog-dot"
              data-lbl-dot
              style={{
                '--lbl-light': dotColor.light,
                '--lbl-dark': dotColor.dark,
              }}
            />
            <div class="geu-devlog-content">
              <div class="geu-devlog-badges">
                {labels.map((label) => {
                  const color = getLabelColor(label);
                  return (
                    <span
                      key={label}
                      class="geu-devlog-badge"
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
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                class="geu-devlog-title"
                title={title}
              >
                {cleanTitle}
              </a>
              {c.description && (
                <p class="geu-devlog-desc">{c.description}</p>
              )}
              <div class="geu-devlog-meta">
                <a
                  href={`https://github.com/${c.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="geu-devlog-repo"
                >
                  {c.repo}
                </a>
              </div>
              <div class="geu-devlog-diff">
                <div class="geu-devlog-diff-bar">
                  <div class="geu-devlog-diff-add" style={{ width: `${addPct}%` }} />
                  <div class="geu-devlog-diff-del" style={{ width: `${delPct}%` }} />
                </div>
                <span class="geu-devlog-diff-nums">
                  <span class="geu-devlog-add">+{c.additions}</span>
                  <span class="geu-devlog-del">-{c.deletions}</span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
