import { db, contributions } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { getSession, errorResponse } from '@/lib/auth-server';
import { validateUpdateContribution } from '@/lib/validation/contribution';
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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }

  const { id } = await params;

  // Ownership check up front so we return 404 (not 400) for "not yours".
  const existing = await db.query.contributions.findFirst({
    where: and(eq(contributions.id, id), eq(contributions.userId, session.user.id)),
  });
  if (!existing) {
    return errorResponse('Contribution not found', 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const result = validateUpdateContribution(body);
  if (!result.ok) {
    return Response.json({ error: 'Validation failed', fields: result.errors }, { status: 400 });
  }

  // Build patch with only the fields the client sent.
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if ('titleOverride' in result.data) patch.titleOverride = result.data.titleOverride;
  if ('description' in result.data) patch.description = result.data.description;
  if ('blogUrl' in result.data) patch.blogUrl = result.data.blogUrl;
  if ('blogOpenInNewTab' in result.data) patch.blogOpenInNewTab = result.data.blogOpenInNewTab;
  if ('labels' in result.data) patch.labels = result.data.labels;

  const [updated] = await db
    .update(contributions)
    .set(patch)
    .where(and(eq(contributions.id, id), eq(contributions.userId, session.user.id)))
    .returning();

  if (!updated) {
    return errorResponse('Contribution not found', 404);
  }

  return Response.json(updated);
}
