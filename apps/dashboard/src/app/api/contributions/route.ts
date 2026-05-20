import type { NextRequest } from 'next/server';
import { db, contributions } from '@/lib/db';
import { eq, and, asc, desc, count, isNull } from 'drizzle-orm';
import { getSession, errorResponse } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }

  const searchParams = request.nextUrl.searchParams;
  const repo = searchParams.get('repo');
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100);
  const offset = Number(searchParams.get('offset') ?? 0);
  const sort = searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest';

  const conditions = [eq(contributions.userId, session.user.id), isNull(contributions.deletedAt)];

  if (repo) {
    conditions.push(eq(contributions.repo, repo));
  }

  const where = and(...conditions);

  // Sort by mergedAt when available (falls back to createdAt via asc/desc
  // over the nullable column — newest-first puts nulls last in SQLite).
  const orderCol = contributions.mergedAt;
  const orderBy = sort === 'oldest' ? asc(orderCol) : desc(orderCol);

  const [results, [total]] = await Promise.all([
    db.select().from(contributions).where(where).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ count: count() }).from(contributions).where(where),
  ]);

  return Response.json({
    data: results,
    pagination: { limit, offset, total: total.count },
    filters: { repo, sort },
  });
}
