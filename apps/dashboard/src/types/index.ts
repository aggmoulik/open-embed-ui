export type { WidgetLayout, WidgetConfig } from '@github-embed-ui/types';
export type { BaseContribution } from '@github-embed-ui/types';

import type { WidgetConfig } from '@github-embed-ui/types';
import type { BaseContribution } from '@github-embed-ui/types';

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
