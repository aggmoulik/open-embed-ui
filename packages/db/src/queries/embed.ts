/**
 * Embed payload serializer.
 *
 * Single source of truth for the JSON shape returned by:
 *   - `/api/embed/[widgetId]` (live API)
 *   - `pnpm export:widget` (static export CLI)
 *
 * Both paths MUST return the exact same shape so that widget code never
 * needs to branch on whether data came from the API or a static file.
 */

import { and, desc, eq, isNull } from 'drizzle-orm';
import type { WidgetConfig } from '@open-embed-ui/types';
import { db } from '../index';
import { contributions, users, widgets } from '../schema';

export interface EmbedPayload {
  widget: {
    name: string;
    config: WidgetConfig;
  };
  contributions: SerializedContribution[];
  user: {
    name: string;
    image: string | null;
    githubUsername: string | null;
  } | null;
}

export interface SerializedContribution {
  id: string;
  title: string;
  titleOverride: string | null;
  url: string;
  repo: string;
  repoOwner: string;
  repoName: string;
  mergedAt: string | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  labels: string[] | null;
}

export interface GetEmbedPayloadOptions {
  /**
   * If true, returns the widget even if `isPublic` is false. Use this for
   * owner-driven static exports where the dashboard public/private flag is
   * not relevant (the user controls what gets shipped). Default: false.
   */
  ignorePublicFlag?: boolean;
}

/**
 * Internal shape returned by `getEmbedPayload`. Separates client-facing
 * data (`payload`) from access-control metadata (`allowedOrigins`) that
 * must NOT leak to the client.
 */
export interface EmbedPayloadResult {
  payload: EmbedPayload;
  allowedOrigins: string[] | null;
}

/**
 * Returns the embed payload + access policy for a widget, or `null` if
 * not found / not eligible.
 *
 * Eligibility (default):
 *   - widget exists
 *   - widget.isPublic === true
 *   - widget.deletedAt === null
 *   - widget owner.deletedAt === null
 */
export async function getEmbedPayload(
  widgetId: string,
  opts: GetEmbedPayloadOptions = {},
): Promise<EmbedPayloadResult | null> {
  const widgetWhere = opts.ignorePublicFlag
    ? and(eq(widgets.id, widgetId), isNull(widgets.deletedAt))
    : and(eq(widgets.id, widgetId), eq(widgets.isPublic, true), isNull(widgets.deletedAt));

  const widget = await db.query.widgets.findFirst({ where: widgetWhere });
  if (!widget) return null;

  const config: WidgetConfig = (widget.config as WidgetConfig) ?? {};

  const [user, prs] = await Promise.all([
    db.query.users.findFirst({
      where: and(eq(users.id, widget.userId), isNull(users.deletedAt)),
    }),
    db
      .select()
      .from(contributions)
      .where(and(eq(contributions.userId, widget.userId), isNull(contributions.deletedAt)))
      .orderBy(desc(contributions.mergedAt)),
  ]);

  // Filtering rules — must match the dashboard API exactly.
  let filtered = prs;

  if (config.timeRange && config.timeRange !== 'all') {
    const now = Date.now();
    const ranges = { week: 7, month: 30, year: 365 } as const;
    const days = ranges[config.timeRange];
    const since = new Date(now - days * 24 * 60 * 60 * 1000);
    filtered = filtered.filter((c) => c.mergedAt && c.mergedAt >= since);
  }

  if (config.selectedPRs && config.selectedPRs.length > 0) {
    const selectedSet = new Set(config.selectedPRs);
    filtered = filtered.filter((c) => selectedSet.has(c.id));
  }

  if (config.maxItems) {
    filtered = filtered.slice(0, config.maxItems);
  }

  const payload: EmbedPayload = {
    widget: { name: widget.name, config },
    contributions: filtered.map((c) => ({
      id: c.id,
      title: c.title,
      titleOverride: c.titleOverride ?? null,
      url: c.url,
      repo: c.repo,
      repoOwner: c.repoOwner,
      repoName: c.repoName,
      mergedAt: c.mergedAt?.toISOString() ?? null,
      additions: c.additions,
      deletions: c.deletions,
      changedFiles: c.changedFiles,
      labels: (c.labels as string[] | null) ?? null,
      // User-authored metadata (feature 11). The shared widget components
      // consume these — PRCard renders the description below the meta row
      // and the blog-link affordance uses blogUrl/blogOpenInNewTab.
      description: c.description ?? null,
      blogUrl: c.blogUrl ?? null,
      blogOpenInNewTab: c.blogOpenInNewTab,
    })),
    user: user
      ? { name: user.name, image: user.image, githubUsername: user.githubUsername }
      : null,
  };

  return {
    payload,
    allowedOrigins: (widget.allowedOrigins as string[] | null) ?? null,
  };
}
