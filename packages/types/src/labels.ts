/**
 * Predefined contribution labels (feature 13).
 *
 * This is the single source of truth for the closed label set, their
 * display colors, and the conventional-commit → label mapping. Consumed
 * by both the dashboard (validation + edit dialog) and the widget
 * (badge rendering + auto-detection fallback).
 */

export interface LabelDef {
  /** The label value stored in the DB (all uppercase). */
  value: string;
  /** Light-theme color (darker tones for white bg). */
  colorLight: string;
  /** Dark-theme color (brighter tones for black bg). */
  colorDark: string;
}

/** The complete, closed set of allowed labels. Order matters for UI display. */
export const PREDEFINED_LABELS: LabelDef[] = [
  { value: 'MERGED',          colorLight: '#16a34a', colorDark: '#4ade80' },
  { value: 'FEATURE',         colorLight: '#0d9488', colorDark: '#2dd4bf' },
  { value: 'BUG FIX',         colorLight: '#dc2626', colorDark: '#f87171' },
  { value: 'PERFORMANCE',     colorLight: '#b45309', colorDark: '#e8b547' },
  { value: 'REFACTOR',        colorLight: '#2563eb', colorDark: '#60a5fa' },
  { value: 'DOCUMENTATION',   colorLight: '#7c3aed', colorDark: '#c4b5fd' },
  { value: 'TESTING',         colorLight: '#ea580c', colorDark: '#fb923c' },
  { value: 'CHORE',           colorLight: '#64748b', colorDark: '#94a3b8' },
  { value: 'CI/CD',           colorLight: '#65a30d', colorDark: '#a3e635' },
  { value: 'STYLE',           colorLight: '#db2777', colorDark: '#f472b6' },
  { value: 'BUILD',           colorLight: '#0284c7', colorDark: '#38bdf8' },
  { value: 'REVERT',          colorLight: '#ef4444', colorDark: '#fca5a5' },
  { value: 'SECURITY',        colorLight: '#b91c1c', colorDark: '#fca5a5' },
  { value: 'BREAKING CHANGE', colorLight: '#9f1239', colorDark: '#fb7185' },
  { value: 'DEPRECATION',     colorLight: '#78716c', colorDark: '#a8a29e' },
];

/** Set of valid label values for O(1) validation. */
export const VALID_LABELS = new Set(PREDEFINED_LABELS.map((l) => l.value));

/** Max labels per contribution. */
export const LABELS_MAX_COUNT = 2;

/**
 * Map from conventional-commit prefix → predefined label value.
 * Used for auto-detection when `contribution.labels` is null.
 */
export const PREFIX_TO_LABEL: Record<string, string> = {
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
const COLOR_MAP = new Map(PREDEFINED_LABELS.map((l) => [l.value, l]));

export function getLabelColor(label: string): { light: string; dark: string } {
  const def = COLOR_MAP.get(label);
  if (def) return { light: def.colorLight, dark: def.colorDark };
  return { light: '#64748b', dark: '#94a3b8' }; // fallback gray
}

/**
 * Detect the conventional-commit prefix from a PR title.
 * Returns the prefix string (e.g. 'feat') or null if no prefix.
 */
export function detectPrefix(title: string): string | null {
  const m = title.match(
    /^(feat|fix|chore|docs|refactor|perf|test|style|build|ci|revert)(?:\([^)]*\))?:/i,
  );
  return m ? m[1].toLowerCase() : null;
}

/**
 * Get the labels to display for a contribution.
 *
 * - If `contribution.labels` is a non-empty array, return it (user-set).
 * - Otherwise, auto-detect: `['MERGED', PREFIX_TO_LABEL[prefix] || 'MERGED']`.
 *   If only one label can be detected, return just `['MERGED']`.
 */
export function getDisplayLabels(title: string, labels?: string[] | null): string[] {
  if (labels && labels.length > 0) return labels;
  const prefix = detectPrefix(title);
  const kind = prefix ? PREFIX_TO_LABEL[prefix] : null;
  if (kind && kind !== 'MERGED') return ['MERGED', kind];
  return ['MERGED'];
}

/**
 * Strip the conventional-commit prefix from a title. Only strips when
 * labels are auto-detected (null); when user has set explicit labels,
 * return the title unchanged (the user's labels may not match the prefix).
 */
export function getCleanTitle(title: string, labels?: string[] | null): string {
  if (labels && labels.length > 0) return title;
  return title.replace(
    /^(feat|fix|chore|docs|refactor|perf|test|style|build|ci|revert)(?:\([^)]*\))?:\s*/i,
    '',
  );
}
