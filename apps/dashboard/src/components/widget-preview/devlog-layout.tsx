import type { Contribution } from '@/types';

interface LogLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

/**
 * Dashboard preview mirror of `packages/widget/src/layouts/LogLayout.tsx`.
 *
 * Vertical timeline layout with diff bars. Thin vertical line on the left,
 * colored dots per entry, MERGED badge + kind badge, title, description,
 * repo, and a proportional green/red diff bar.
 * Supports light/dark via `.dark` ancestor.
 */
export function DevlogLayout({ contributions, titleOverrides }: LogLayoutProps) {
  if (contributions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        No contributions match these filters.
      </div>
    );
  }

  return (
    <div className="geu-devlog">
      <div className="geu-devlog-line" />
      {contributions.map((c) => {
        const title = titleOverrides?.[c.id] || c.title;
        const kind = detectKind(title);
        const kindLabel = KIND_LABELS[kind] || 'MERGE';
        const cleanTitle = stripConventionalPrefix(title);
        const total = c.additions + c.deletions;
        const addPct = total === 0 ? 50 : (c.additions / total) * 100;
        const delPct = 100 - addPct;

        return (
          <div key={c.id} className="geu-devlog-entry">
            <div className={`geu-devlog-dot geu-devlog-dot-${kind}`} />
            <div className="geu-devlog-content">
              <div className="geu-devlog-badges">
                <span className="geu-devlog-badge-merged">MERGED</span>
                <span className={`geu-devlog-badge-kind geu-devlog-badge-kind-${kind}`}>
                  {kindLabel}
                </span>
              </div>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="geu-devlog-title"
                title={title}
              >
                {cleanTitle}
              </a>
              {c.description && (
                <p className="geu-devlog-desc">{c.description}</p>
              )}
              <div className="geu-devlog-meta">
                <a
                  href={`https://github.com/${c.repo}`}
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

// --- helpers (mirrors packages/widget/src/layouts/LogLayout.tsx) -----------

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
