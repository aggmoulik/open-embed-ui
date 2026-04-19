import type { NextRequest } from 'next/server';
import { db, widgets, isValidOriginEntry } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { getSession, errorResponse } from '@/lib/auth-server';

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
  if (body.config !== undefined) updates.config = body.config;
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
