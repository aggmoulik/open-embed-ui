export type { WidgetLayout, WidgetConfig } from '@open-embed-ui/types';
export type { BaseContribution } from '@open-embed-ui/types';

import type { WidgetConfig } from '@open-embed-ui/types';
import type { BaseContribution } from '@open-embed-ui/types';

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

/** Dashboard contribution with DB-specific fields. */
export interface Contribution extends BaseContribution {
  githubId: string;
  mergedAt?: Date | null;
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
  /**
   * Per-widget origin allowlist enforced at /api/embed/:id and on the
   * embed-api worker. `null` = unrestricted (any origin can fetch).
   * Each entry is one of:
   *   - "https://exact.com"      exact origin
   *   - "*.example.com"          wildcard subdomain (apex NOT included)
   *   - "http://localhost:*"     any port on localhost
   */
  allowedOrigins?: string[] | null;
  createdAt: Date;
  updatedAt: Date;
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
