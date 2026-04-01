export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  githubId?: string | null;
  githubUsername?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contribution {
  id: string;
  title: string;
  url: string;
  repo: string;
  repoOwner: string;
  repoName: string;
  githubId: string;
  mergedAt?: Date | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Widget {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  config: WidgetConfig;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetConfig {
  theme?: 'light' | 'dark' | 'system';
  repos?: string[];
  timeRange?: 'week' | 'month' | 'year' | 'all';
  layout?: 'grid' | 'list' | 'timeline';
  maxItems?: number;
}

export interface Embed {
  id: string;
  widgetId: string;
  embedCode: string;
  allowedDomains?: string | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}
