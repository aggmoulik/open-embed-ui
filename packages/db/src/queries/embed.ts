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
import { PRESETS } from '@open-embed-ui/types';
import type { WidgetConfig } from '@open-embed-ui/types';
import { db } from '../index';
import { contributions, widgets } from '../schema';

export interface EmbedPayload {
  widget: {
    name: string;
    config: WidgetConfig;
  };
  contributions: SerializedContribution[];
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

  // `rawConfig` carries the full DB config — used for server-side
  // filtering (selectedPRs, maxItems). `config` is the trimmed shape sent
  // to the widget (layout, titleOverrides, themeOverrides only).
  const rawConfig: WidgetConfig = (widget.config as WidgetConfig) ?? {};
  const config = normalizeConfigForPayload(rawConfig);

  // User profile fields are no longer shipped — the widget renders only
  // contributions and watermark, never per-user metadata. Drop the users
  // query entirely. Owner deletion eligibility is enforced upstream by
  // the soft-delete check on the contributions query (they all share the
  // same userId so a deleted user yields zero contributions).
  const prs = await db
    .select()
    .from(contributions)
    .where(and(eq(contributions.userId, widget.userId), isNull(contributions.deletedAt)))
    .orderBy(desc(contributions.mergedAt));

  // Filtering rules — must match the dashboard API exactly. Read from
  // `rawConfig` because `config` has had these fields stripped for the
  // payload contract.
  let filtered = prs;

  if (rawConfig.selectedPRs && rawConfig.selectedPRs.length > 0) {
    const selectedSet = new Set(rawConfig.selectedPRs);
    filtered = filtered.filter((c) => selectedSet.has(c.id));
  }

  if (rawConfig.maxItems) {
    filtered = filtered.slice(0, rawConfig.maxItems);
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
  };

  return {
    payload,
    allowedOrigins: (widget.allowedOrigins as string[] | null) ?? null,
  };
}

/**
 * Normalize the stored WidgetConfig for the embed payload:
 *
 *   1. If `themeOverrides` is set, fill any missing keys from the chosen
 *      preset's defaults so the widget receives a complete token map. Older
 *      widgets stored sparse overrides (only modified keys); the widget
 *      runtime no longer knows about presets and reads themeOverrides
 *      verbatim, so the server has to flatten preset+sparse into the full
 *      data the widget needs.
 *
 *   2. Strip the `preset` field — it's dashboard UI metadata (which preset
 *      name was selected as a starting point), not something the widget
 *      runtime needs. Keeps the payload small and the contract clean.
 *
 * Widgets with no themeOverrides keep their bundled widget.css defaults —
 * no injection runs.
 */
function normalizeConfigForPayload(config: WidgetConfig): WidgetConfig {
  // Strip fields the widget doesn't read at render time:
  //   - preset, repos, selectedPRs, maxItems: server-applied or
  //     dashboard-only metadata. The contributions list is already filtered
  //     server-side, so the widget doesn't need to re-apply any of these.
  // The widget reads only: layout, titleOverrides, themeOverrides.
  const { preset, themeOverrides, layout, titleOverrides } = config;

  const trimmed: WidgetConfig = {};
  if (layout) trimmed.layout = layout;
  if (titleOverrides) trimmed.titleOverrides = titleOverrides;

  if (!themeOverrides) return trimmed;
  const presetId = preset ?? 'default';
  const presetTokens = PRESETS[presetId] ?? PRESETS.default;
  trimmed.themeOverrides = {
    light: { ...presetTokens.light, ...(themeOverrides.light ?? {}) },
    dark: { ...presetTokens.dark, ...(themeOverrides.dark ?? {}) },
  };
  return trimmed;
}
