export type { WidgetLayout, WidgetConfig } from '@open-embed-ui/types';
export type { BaseContribution } from '@open-embed-ui/types';

import type { WidgetConfig } from '@open-embed-ui/types';
import type { BaseContribution } from '@open-embed-ui/types';

export interface WidgetOptions {
  /**
   * Widget ID for API-driven mode. Required unless `dataSrc` is provided.
   * The widget will fetch `${baseUrl}/api/embed/${widgetId}`.
   */
  widgetId?: string;

  /**
   * Static mode: URL to a pre-exported widget-data.json file.
   * When set, the widget fetches this URL directly and ignores `widgetId` + `baseUrl`.
   * Use this for self-hosted/static deployments (e.g. shipping the widget on a static site
   * via `pnpm export:widget`).
   */
  dataSrc?: string;

  theme?: 'light' | 'dark' | 'system';
  baseUrl?: string;
}

export interface WidgetData {
  widget: {
    name: string;
    config: WidgetConfig;
  };
  contributions: Contribution[];
}

/** Widget-facing contribution (mergedAt is always a string from the API). */
export interface Contribution extends BaseContribution {
  mergedAt: string | null;
}
