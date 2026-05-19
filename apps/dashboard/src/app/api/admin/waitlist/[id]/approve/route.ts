import { eq } from 'drizzle-orm';
import { db, waitlist } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { isAdmin } from '@/lib/admin';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/waitlist/[id]/approve
 *
 * Toggle approval status on a waitlist signup. Admin-only.
 *
 * Body shape: `{ "approved": true | false }`. When `true`, `approvedAt` is
 * set to `new Date()`; when `false`, `approvedAt` is set to NULL.
 *
 * Returns 404 (not 403) for non-admin callers so the existence of the
 * admin surface isn't leaked to authenticated non-admin users.
 */
export async function POST(request: Request, ctx: RouteContext) {
  const session = await getSession();
  if (!isAdmin(session)) {
    return new Response('Not found', { status: 404 });
  }

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const approved =
    body && typeof body === 'object' && 'approved' in body
      ? Boolean((body as { approved: unknown }).approved)
      : false;

  const result = await db
    .update(waitlist)
    .set({ approvedAt: approved ? new Date() : null })
    .where(eq(waitlist.id, id))
    .returning({ id: waitlist.id, email: waitlist.email, approvedAt: waitlist.approvedAt });

  if (result.length === 0) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json({ ok: true, row: result[0] });
}
