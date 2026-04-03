import { db, users, widgets, contributions, embeds, sessions } from '@/lib/db';
import { eq, inArray } from 'drizzle-orm';
import { getSession, errorResponse } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  const session = await getSession();
  if (!session) return errorResponse('Unauthorized', 401);

  const userId = session.user.id;
  const now = new Date();

  // Get user's widget IDs for cascading to embeds
  const userWidgets = await db
    .select({ id: widgets.id })
    .from(widgets)
    .where(eq(widgets.userId, userId));

  const widgetIds = userWidgets.map((w) => w.id);

  // Soft-delete all related data
  await db.update(users).set({ deletedAt: now, updatedAt: now }).where(eq(users.id, userId));
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

  // Revoke all sessions so user is logged out
  await db.delete(sessions).where(eq(sessions.userId, userId));

  return Response.json({ message: 'Account deactivated' });
}
