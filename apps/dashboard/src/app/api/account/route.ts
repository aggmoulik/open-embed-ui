import {
  db,
  users,
  widgets,
  contributions,
  embeds,
  sessions,
  accounts,
  accountDeletions,
} from '@/lib/db';
import { eq, inArray, count } from 'drizzle-orm';
import { getSession, errorResponse } from '@/lib/auth-server';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  const session = await getSession();
  if (!session) return errorResponse('Unauthorized', 401);

  const userId = session.user.id;
  const now = new Date();

  // Snapshot the user's identity before anonymizing
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return errorResponse('User not found', 404);

  const [widgetStats] = await db
    .select({ count: count() })
    .from(widgets)
    .where(eq(widgets.userId, userId));
  const [contribStats] = await db
    .select({ count: count() })
    .from(contributions)
    .where(eq(contributions.userId, userId));

  // Record the deletion audit trail
  await db.insert(accountDeletions).values({
    id: randomUUID(),
    userId,
    email: user.email,
    name: user.name,
    githubUsername: user.githubUsername,
    githubId: user.githubId,
    widgetCount: widgetStats.count,
    contributionCount: contribStats.count,
    accountCreatedAt: user.createdAt,
    deletedAt: now,
  });

  // Get user's widget IDs for cascading to embeds
  const userWidgets = await db
    .select({ id: widgets.id })
    .from(widgets)
    .where(eq(widgets.userId, userId));

  const widgetIds = userWidgets.map((w) => w.id);

  // Anonymize the user so the email/githubId are freed up for a fresh account.
  // better-auth looks up users by email — if we keep it, re-login reuses this row.
  const tombstone = randomUUID();
  await db
    .update(users)
    .set({
      email: `deleted+${tombstone}@deactivated.local`,
      githubId: null,
      githubUsername: null,
      deletedAt: now,
      updatedAt: now,
    })
    .where(eq(users.id, userId));

  // Soft-delete related data
  await db
    .update(widgets)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(widgets.userId, userId));
  await db
    .update(contributions)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(contributions.userId, userId));

  if (widgetIds.length > 0) {
    await db
      .update(embeds)
      .set({ deletedAt: now, updatedAt: now })
      .where(inArray(embeds.widgetId, widgetIds));
  }

  // Remove OAuth accounts so GitHub ID is freed for fresh signup
  await db.delete(accounts).where(eq(accounts.userId, userId));

  // Revoke all sessions so user is logged out
  await db.delete(sessions).where(eq(sessions.userId, userId));

  return Response.json({ message: 'Account deactivated' });
}
