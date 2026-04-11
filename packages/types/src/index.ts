export type WidgetLayout =
  | 'grid'
  | 'list'
  | 'timeline'
  | 'single-card'
  | 'marquee'
  | 'carousel'
  | 'masonry'
  | 'highlight';

export interface WidgetConfig {
  theme?: 'light' | 'dark' | 'system';
  layout?: WidgetLayout;
  repos?: string[];
  timeRange?: 'week' | 'month' | 'year' | 'all';
  maxItems?: number;
  selectedPRs?: string[];
  titleOverrides?: Record<string, string>;
}

/** Base contribution fields shared across widget and dashboard. */
export interface BaseContribution {
  id: string;
  title: string;
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
}
