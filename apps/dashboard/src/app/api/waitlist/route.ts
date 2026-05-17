import { isValidEmail } from '@/lib/validation/email';

// TODO(waitlist-storage): wire to a `waitlist` Drizzle table when ready.
//   import { db, waitlist } from '@/lib/db';
//   await db.insert(waitlist).values({ email, createdAt: new Date() })
//     .onConflictDoNothing({ target: waitlist.email });
// For now we intentionally accept-and-discard so the form feels real
// during the pre-launch phase (feature 14).

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = (body as { email?: unknown })?.email;
  if (!isValidEmail(email)) {
    return Response.json({ error: 'Invalid email' }, { status: 400 });
  }

  return Response.json({ ok: true });
}
