import type { NextRequest } from 'next/server';
import { db } from '@/db';
import { widgets } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { getSession, errorResponse } from '@/lib/auth-server';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return errorResponse('Unauthorized', 401);

  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100);
  const offset = Number(searchParams.get('offset') ?? 0);

  const [results, [total]] = await Promise.all([
    db
      .select()
      .from(widgets)
      .where(eq(widgets.userId, session.user.id))
      .orderBy(desc(widgets.updatedAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(widgets).where(eq(widgets.userId, session.user.id)),
  ]);

  return Response.json({
    data: results,
    pagination: { limit, offset, total: total.count },
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return errorResponse('Unauthorized', 401);

  const body = await request.json();
  const { name, description, config } = body;

  if (!name || typeof name !== 'string') {
    return errorResponse('Name is required', 400);
  }

  const id = randomUUID();

  await db.insert(widgets).values({
    id,
    userId: session.user.id,
    name: name.trim(),
    description: description?.trim() || null,
    config: config ?? { theme: 'system', layout: 'grid', timeRange: 'all', maxItems: 10 },
    isPublic: true,
  });

  const widget = await db.query.widgets.findFirst({ where: eq(widgets.id, id) });

  return Response.json({ data: widget }, { status: 201 });
}
