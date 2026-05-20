import type { NextRequest } from 'next/server';
import { db, widgets, isValidOriginEntry } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { getSession, errorResponse } from '@/lib/auth-server';
import { sanitizeOverrides } from '@open-embed-ui/types';
import type { WidgetConfig, ThemeOverrides } from '@open-embed-ui/types';

export const dynamic = 'force-dynamic';

const MAX_ALLOWED_ORIGINS = 20;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  const widget = await db.query.widgets.findFirst({
    where: and(eq(widgets.id, id), eq(widgets.userId, session.user.id)),
  });

  if (!widget) return errorResponse('Widget not found', 404);

  return Response.json({ data: widget });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  const existing = await db.query.widgets.findFirst({
    where: and(eq(widgets.id, id), eq(widgets.userId, session.user.id)),
  });

  if (!existing) return errorResponse('Widget not found', 404);

  const body = await request.json();
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.description !== undefined) updates.description = body.description?.trim() || null;
  if (body.config !== undefined) {
    const cleaned = sanitizeWidgetConfig(body.config);
    if (cleaned instanceof Response) return cleaned;
    updates.config = cleaned;
  }
  if (body.isPublic !== undefined) updates.isPublic = body.isPublic;

  if ('allowedOrigins' in body) {
    // Default-deny policy: every widget must have at least one
    // allowed origin. PATCH cannot clear the allowlist (that would
    // turn the widget into a public free-for-all). Owners must
    // either replace the list or delete the widget entirely.
    const value = body.allowedOrigins;
    if (!Array.isArray(value)) {
      return errorResponse('allowedOrigins must be an array of strings', 400);
    }
    if (value.length === 0) {
      return errorResponse('allowedOrigins cannot be empty — at least one origin is required', 400);
    }
    if (value.length > MAX_ALLOWED_ORIGINS) {
      return errorResponse(
        `allowedOrigins cannot have more than ${MAX_ALLOWED_ORIGINS} entries`,
        400,
      );
    }
    const cleaned = value.map((v: unknown) => (typeof v === 'string' ? v.trim() : ''));
    const invalid = cleaned.filter((v: string) => v.length === 0 || !isValidOriginEntry(v));
    if (invalid.length > 0) {
      return errorResponse(`Invalid origin entries: ${invalid.join(', ')}`, 400);
    }
    updates.allowedOrigins = cleaned;
  }

  await db.update(widgets).set(updates).where(eq(widgets.id, id));

  const updated = await db.query.widgets.findFirst({ where: eq(widgets.id, id) });

  return Response.json({ data: updated });
}

/**
 * Validate and sanitize a WidgetConfig payload before persistence. Drops
 * individual invalid OKLCH values silently; returns a 400 Response if the
 * owner sent overrides AND every single one failed validation (signals a
 * client bug).
 */
function sanitizeWidgetConfig(config: WidgetConfig): WidgetConfig | Response {
  if (!config || typeof config !== 'object') return config;
  const overrides = config.themeOverrides;
  if (!overrides) return config;

  const cleanLight = sanitizeOverrides(overrides.light);
  const cleanDark = sanitizeOverrides(overrides.dark);

  const allLightInvalid = overrides.light && !cleanLight;
  const allDarkInvalid = overrides.dark && !cleanDark;
  const sentLight = Boolean(overrides.light && Object.keys(overrides.light).length);
  const sentDark = Boolean(overrides.dark && Object.keys(overrides.dark).length);
  if (sentLight && sentDark && allLightInvalid && allDarkInvalid) {
    return errorResponse('All theme overrides failed OKLCH validation', 400);
  }
  if (sentLight && !sentDark && allLightInvalid) {
    return errorResponse('All theme overrides failed OKLCH validation', 400);
  }
  if (sentDark && !sentLight && allDarkInvalid) {
    return errorResponse('All theme overrides failed OKLCH validation', 400);
  }

  const next: ThemeOverrides = {};
  if (cleanLight) next.light = cleanLight;
  if (cleanDark) next.dark = cleanDark;

  return {
    ...config,
    themeOverrides: Object.keys(next).length > 0 ? next : undefined,
  };
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  const existing = await db.query.widgets.findFirst({
    where: and(eq(widgets.id, id), eq(widgets.userId, session.user.id)),
  });

  if (!existing) return errorResponse('Widget not found', 404);

  await db.delete(widgets).where(eq(widgets.id, id));

  return Response.json({ message: 'Widget deleted' });
}
