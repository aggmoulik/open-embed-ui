import { and, eq, isNotNull } from 'drizzle-orm';
import { db, waitlist } from '@/lib/db';
import { isAdmin } from './admin';

/**
 * Check whether an email is allowed to complete the GitHub OAuth sign-in
 * during the closed beta.
 *
 *   1. Admin allowlist (hard-coded in `admin.ts`) — always allowed.
 *   2. Waitlist row with `approvedAt IS NOT NULL` — admin has invited them.
 *
 * Joining the waitlist is open to anyone (via `/api/waitlist`); approval
 * is a separate admin action from `/dashboard/waitlist`. That two-step
 * shape is what makes this a *closed* beta — every signup needs a human
 * decision before they can reach the dashboard.
 *
 * Wired into `better-auth`'s `databaseHooks.user.create.before`, so the
 * gate runs *before* a `users` row is inserted. Non-approved GitHub
 * accounts never leave behind orphaned user/account records.
 *
 * Existing users (those who already have a `users` row from before the
 * gate landed, or who were approved at some point and then unapproved)
 * are *not* re-checked — the hook only fires on creation. Removing
 * someone from the waitlist or unapproving them later doesn't kick them
 * out of the dashboard; the gate is about who CAN sign up.
 *
 * Email is normalized (`.trim().toLowerCase()`). The waitlist insert path
 * (`/api/waitlist`) already stores lowercase, and `isAdmin` lowercases its
 * input — so the lookup matches both sources case-insensitively.
 */
export async function isInvited(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  // Admin allowlist is sync — no DB hit needed for these.
  if (isAdmin({ user: { email: normalized } })) return true;

  // Waitlist row + admin approval required.
  const row = await db.query.waitlist.findFirst({
    where: and(eq(waitlist.email, normalized), isNotNull(waitlist.approvedAt)),
    columns: { id: true },
  });
  return Boolean(row);
}
