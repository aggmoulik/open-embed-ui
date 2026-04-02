import { db, contributions } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { getSession, errorResponse } from '@/lib/auth-server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }

  const { id } = await params;

  const contribution = await db.query.contributions.findFirst({
    where: and(eq(contributions.id, id), eq(contributions.userId, session.user.id)),
  });

  if (!contribution) {
    return errorResponse('Contribution not found', 404);
  }

  return Response.json(contribution);
}
