import type { NextRequest } from 'next/server';
import { db, widgets, isValidOriginEntry } from '@/lib/db';
import { eq, and, desc, count, isNull } from 'drizzle-orm';
import { getSession, errorResponse } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

const MAX_ALLOWED_ORIGINS = 20;

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
      .where(and(eq(widgets.userId, session.user.id), isNull(widgets.deletedAt)))
      .orderBy(desc(widgets.updatedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(widgets)
      .where(and(eq(widgets.userId, session.user.id), isNull(widgets.deletedAt))),
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
  const { name, description, config, allowedOrigins } = body;

  if (!name || typeof name !== 'string') {
    return errorResponse('Name is required', 400);
  }

  // Default-deny policy: every widget MUST be created with at least
  // one allowed origin. This prevents accidentally publishing a widget
  // that anyone can embed.
  if (!Array.isArray(allowedOrigins) || allowedOrigins.length === 0) {
    return errorResponse('allowedOrigins is required (at least one entry)', 400);
  }
  if (allowedOrigins.length > MAX_ALLOWED_ORIGINS) {
    return errorResponse(
      `allowedOrigins cannot have more than ${MAX_ALLOWED_ORIGINS} entries`,
      400,
    );
  }
  const cleanedOrigins = allowedOrigins.map((v: unknown) =>
    typeof v === 'string' ? v.trim() : '',
  );
  const invalid = cleanedOrigins.filter((v: string) => v.length === 0 || !isValidOriginEntry(v));
  if (invalid.length > 0) {
    return errorResponse(`Invalid origin entries: ${invalid.join(', ')}`, 400);
  }

  const id = crypto.randomUUID();

  await db.insert(widgets).values({
    id,
    userId: session.user.id,
    name: name.trim(),
    description: description?.trim() || null,
    config: config ?? { theme: 'system', layout: 'grid', timeRange: 'all', maxItems: 10 },
    isPublic: true,
    allowedOrigins: cleanedOrigins,
  });

  const widget = await db.query.widgets.findFirst({ where: eq(widgets.id, id) });

  return Response.json({ data: widget }, { status: 201 });
}
