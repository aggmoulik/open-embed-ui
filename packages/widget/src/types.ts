export type { WidgetLayout, WidgetConfig } from '@github-embed-ui/types';
export type { BaseContribution } from '@github-embed-ui/types';

import type { WidgetConfig } from '@github-embed-ui/types';
import type { BaseContribution } from '@github-embed-ui/types';

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

/** Widget-facing contribution (mergedAt is always a string from the API). */
export interface Contribution extends BaseContribution {
  mergedAt: string | null;
}
