import type { NextRequest } from 'next/server';
import { db, contributions } from '@/lib/db';
import { eq, and, desc, count, gte, isNull } from 'drizzle-orm';
import { getSession, errorResponse } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }

  const searchParams = request.nextUrl.searchParams;
  const repo = searchParams.get('repo');
  const timeRange = searchParams.get('timeRange') ?? 'all';
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100);
  const offset = Number(searchParams.get('offset') ?? 0);

  const conditions = [eq(contributions.userId, session.user.id), isNull(contributions.deletedAt)];

  if (repo) {
    conditions.push(eq(contributions.repo, repo));
  }

  if (timeRange !== 'all') {
    const now = new Date();
    const ranges: Record<string, number> = {
      week: 7,
      month: 30,
      year: 365,
    };
    const days = ranges[timeRange];
    if (days) {
      const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      conditions.push(gte(contributions.createdAt, since));
    }
  }

  const where = and(...conditions);

  const [results, [total]] = await Promise.all([
    db
      .select()
      .from(contributions)
      .where(where)
      .orderBy(desc(contributions.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(contributions).where(where),
  ]);

  return Response.json({
    data: results,
    pagination: { limit, offset, total: total.count },
    filters: { repo, timeRange },
  });
}
