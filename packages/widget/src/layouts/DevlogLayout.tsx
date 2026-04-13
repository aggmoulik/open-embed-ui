import type { Contribution } from '../types';

interface Props {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

/**
 * Vertical timeline layout with diff bars.
 *
 * Thin vertical line on the left, colored dots per entry, MERGED badge +
 * kind badge, title, description, repo, and a proportional green/red diff
 * bar. Supports light/dark via `.dark` ancestor.
 */
export function DevlogLayout({ contributions, titleOverrides }: Props) {
  if (contributions.length === 0) {
    return <div class="geu-empty">No contributions to display</div>;
  }

  return (
    <div class="geu-devlog">
      <div class="geu-devlog-line" />
      {contributions.map((c) => {
        const title = titleOverrides?.[c.id] || c.title;
        const kind = detectKind(title);
        const kindLabel = KIND_LABELS[kind] || 'MERGE';
        const cleanTitle = stripConventionalPrefix(title);
        const total = c.additions + c.deletions;
        const addPct = total === 0 ? 50 : (c.additions / total) * 100;
        const delPct = 100 - addPct;

        return (
          <div key={c.id} class="geu-devlog-entry">
            <div class={`geu-devlog-dot geu-devlog-dot-${kind}`} />
            <div class="geu-devlog-content">
              <div class="geu-devlog-badges">
                <span class="geu-devlog-badge-merged">MERGED</span>
                <span class={`geu-devlog-badge-kind geu-devlog-badge-kind-${kind}`}>
                  {kindLabel}
                </span>
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

const KIND_LABELS: Record<string, string> = {
  feat: 'ENHANCEMENT',
  fix: 'BUG FIX',
  perf: 'PERFORMANCE',
  refactor: 'REFACTOR',
  docs: 'DOCUMENTATION',
  chore: 'CHORE',
  test: 'TESTING',
  style: 'STYLE',
  build: 'BUILD',
  ci: 'CI/CD',
  revert: 'REVERT',
  merge: 'MERGE',
};

function detectKind(title: string): string {
  const m = title.match(
    /^(feat|fix|chore|docs|refactor|perf|test|style|build|ci|revert)(?:\([^)]*\))?:/i,
  );
  return (m ? m[1] : 'merge').toLowerCase();
}

function stripConventionalPrefix(title: string): string {
  return title.replace(
    /^(feat|fix|chore|docs|refactor|perf|test|style|build|ci|revert)(?:\([^)]*\))?:\s*/i,
    '',
  );
}
