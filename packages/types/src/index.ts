export { isSafeHttpUrl, safeHref, safeImgSrc } from './url-safe';

export {
  PREDEFINED_LABELS,
  VALID_LABELS,
  LABELS_MAX_COUNT,
  PREFIX_TO_LABEL,
  getLabelColor,
  detectPrefix,
  getDisplayLabels,
  getCleanTitle,
} from './labels';
export type { LabelDef } from './labels';
export { hasBlog, getBlogTarget } from './blog';
export type { BlogTarget } from './blog';

export type WidgetLayout =
  | 'grid'
  | 'list'
  | 'timeline'
  | 'single-card'
  | 'marquee'
  | 'masonry'
  | 'highlight';

export type ThemePresetId = 'default' | 'neutral' | 'violet' | 'rose' | 'mono';

export type ThemeTokenKey =
  | '--color-background'
  | '--color-foreground'
  | '--color-card'
  | '--color-border'
  | '--color-brand'
  | '--color-muted';

export interface ThemeOverrides {
  light?: Partial<Record<ThemeTokenKey, string>>;
  dark?: Partial<Record<ThemeTokenKey, string>>;
}

export interface WidgetConfig {
  preset?: ThemePresetId;
  themeOverrides?: ThemeOverrides;
  layout?: WidgetLayout;
  repos?: string[];
  maxItems?: number;
  selectedPRs?: string[];
  titleOverrides?: Record<string, string>;
}

export { isValidOklch, sanitizeOverrides } from './theme-validate';
export { PRESETS, resolveThemeTokens } from './theme-presets';
export type { ThemePreset } from './theme-presets';

/** Base contribution fields shared across widget and dashboard. */
export interface BaseContribution {
  id: string;
  title: string;
  /** User-set display title. Null = use original GitHub PR title. */
  titleOverride?: string | null;
  url: string;
  repo: string;
  repoOwner: string;
  repoName: string;
  mergedAt?: string | Date | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  // User-authored metadata (feature 11). All optional so widget code that
  // does not consume them compiles unchanged.
  description?: string | null;
  blogUrl?: string | null;
  /** Whether the blog link should open in a new tab. Defaults to true. */
  blogOpenInNewTab?: boolean;
  /** Up to 2 predefined labels. Null = auto-detect from title. */
  labels?: string[] | null;
}
