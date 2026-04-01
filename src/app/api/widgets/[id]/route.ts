import type { NextRequest } from 'next/server';
import { db } from '@/db';
import { widgets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession, errorResponse } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

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

  await db.update(widgets).set(updates).where(eq(widgets.id, id));

  const updated = await db.query.widgets.findFirst({ where: eq(widgets.id, id) });

  return Response.json({ data: updated });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
