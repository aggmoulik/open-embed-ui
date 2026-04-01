import type { NextRequest } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession, errorResponse } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    return errorResponse('User not found', 404);
  }

  return Response.json({
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      githubId: user.githubId,
      githubUsername: user.githubUsername,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }

  const body = await request.json();

  const allowedFields = ['name', 'image'] as const;
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, session.user.id))
    .returning();

  if (!updated) {
    return errorResponse('User not found', 404);
  }

  return Response.json({
    data: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      image: updated.image,
      githubId: updated.githubId,
      githubUsername: updated.githubUsername,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    },
  });
}
