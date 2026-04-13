/**
 * Label utilities for widget badge rendering.
 *
 * Mirrors the label functions from @github-embed-ui/types/labels.
 * Duplicated here because the widget's rollup build cannot transpile
 * raw .ts files from the types package (which has no build step).
 *
 * If the label set or colors change, update both this file and
 * packages/types/src/labels.ts.
 */

interface LabelColor {
  light: string;
  dark: string;
}

const LABEL_COLORS: Record<string, LabelColor> = {
  'MERGED':          { light: '#16a34a', dark: '#4ade80' },
  'FEATURE':         { light: '#0d9488', dark: '#2dd4bf' },
  'BUG FIX':         { light: '#dc2626', dark: '#f87171' },
  'PERFORMANCE':     { light: '#b45309', dark: '#e8b547' },
  'REFACTOR':        { light: '#2563eb', dark: '#60a5fa' },
  'DOCUMENTATION':   { light: '#7c3aed', dark: '#c4b5fd' },
  'TESTING':         { light: '#ea580c', dark: '#fb923c' },
  'CHORE':           { light: '#64748b', dark: '#94a3b8' },
  'CI/CD':           { light: '#65a30d', dark: '#a3e635' },
  'STYLE':           { light: '#db2777', dark: '#f472b6' },
  'BUILD':           { light: '#0284c7', dark: '#38bdf8' },
  'REVERT':          { light: '#ef4444', dark: '#fca5a5' },
  'SECURITY':        { light: '#b91c1c', dark: '#fca5a5' },
  'BREAKING CHANGE': { light: '#9f1239', dark: '#fb7185' },
  'DEPRECATION':     { light: '#78716c', dark: '#a8a29e' },
};

const FALLBACK_COLOR: LabelColor = { light: '#64748b', dark: '#94a3b8' };

const PREFIX_TO_LABEL: Record<string, string> = {
  feat: 'FEATURE',
  fix: 'BUG FIX',
  perf: 'PERFORMANCE',
  refactor: 'REFACTOR',
  docs: 'DOCUMENTATION',
  test: 'TESTING',
  chore: 'CHORE',
  ci: 'CI/CD',
  style: 'STYLE',
  build: 'BUILD',
  revert: 'REVERT',
};

/** Color lookup by label value. Returns light/dark pair. */
export function getLabelColor(label: string): LabelColor {
  return LABEL_COLORS[label] || FALLBACK_COLOR;
}

function detectPrefix(title: string): string | null {
  const m = title.match(
    /^(feat|fix|chore|docs|refactor|perf|test|style|build|ci|revert)(?:\([^)]*\))?:/i,
  );
  return m ? m[1].toLowerCase() : null;
}

/**
 * Get the labels to display for a contribution.
 *
 * - If stored labels exist, return them.
 * - Otherwise auto-detect from the title's conventional-commit prefix.
 */
export function getDisplayLabels(title: string, labels?: string[] | null): string[] {
  if (labels && labels.length > 0) return labels;
  const prefix = detectPrefix(title);
  const kind = prefix ? PREFIX_TO_LABEL[prefix] : null;
  if (kind && kind !== 'MERGED') return ['MERGED', kind];
  return ['MERGED'];
}

/**
 * Strip the conventional-commit prefix from a title.
 * Only strips when labels are auto-detected (null).
 */
export function getCleanTitle(title: string, labels?: string[] | null): string {
  if (labels && labels.length > 0) return title;
  return title.replace(
    /^(feat|fix|chore|docs|refactor|perf|test|style|build|ci|revert)(?:\([^)]*\))?:\s*/i,
    '',
  );
}
