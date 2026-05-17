import { getSession } from '@/lib/auth-server';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

// Tiny endpoint exposing session-derived flags to client components.
// Currently just `isAdmin`, used by the widget builder to decide which
// layouts to show in the picker (featured-5 for everyone vs all-12 for
// admins). No PII returned — the admin check is server-side via the
// same allowlist as /dashboard/waitlist.
export async function GET() {
  const session = await getSession();
  return Response.json({
    isAuthenticated: !!session,
    isAdmin: isAdmin(session),
  });
}
