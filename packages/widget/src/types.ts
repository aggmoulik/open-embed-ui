export interface WidgetOptions {
  widgetId: string;
  theme?: 'light' | 'dark' | 'system';
  baseUrl?: string;
}

export interface WidgetData {
  widget: {
    name: string;
    config: WidgetConfig;
  };
  contributions: Contribution[];
  user: {
    name: string;
    image: string | null;
    githubUsername: string | null;
  };
}

export interface WidgetConfig {
  theme?: 'light' | 'dark' | 'system';
  layout?: 'grid' | 'list' | 'timeline' | 'single-card';
  repos?: string[];
  timeRange?: 'week' | 'month' | 'year' | 'all';
  maxItems?: number;
  selectedPRs?: string[];
  titleOverrides?: Record<string, string>;
}

export interface Contribution {
  id: string;
  title: string;
  url: string;
  repo: string;
  repoOwner: string;
  repoName: string;
  mergedAt: string | null;
  additions: number;
  deletions: number;
  changedFiles: number;
}
