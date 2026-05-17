import { db, waitlist } from '@/lib/db';
import { isValidEmail } from '@/lib/validation/email';
import { checkAndRecordAttempt, getClientIp, hashIp } from '@/lib/rate-limit';

const MAX_UTM_LEN = 128;

function cleanUtm(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_UTM_LEN);
}

export async function POST(request: Request) {
  // Rate limit FIRST — never touch waitlist table on rate-limited requests.
  const ipHash = await hashIp(getClientIp(request));
  const rate = await checkAndRecordAttempt(ipHash);
  if (!rate.allowed) {
    return Response.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  if (!isValidEmail(email)) {
    return Response.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Source = external referrer captured client-side from `document.referrer`
  // at page load. We can't read it from the server's HTTP `Referer` header
  // because that always points to the page that sent the form POST — i.e.,
  // the landing page itself. Validate it parses as a URL before storing.
  const rawRef = typeof b.referrer === 'string' ? b.referrer.trim().slice(0, 512) : '';
  let source: string | null = null;
  if (rawRef) {
    try {
      new URL(rawRef);
      source = rawRef;
    } catch {
      // Invalid URL — silently drop, don't fail the signup.
    }
  }

  // Idempotent: re-submitting the same email is a silent success — avoids
  // leaking "is this email registered?" and matches the user-facing copy
  // ("you're on the list") for both first and repeat submissions.
  await db
    .insert(waitlist)
    .values({
      id: crypto.randomUUID(),
      email,
      source,
      utmSource: cleanUtm(b.utm_source),
      utmMedium: cleanUtm(b.utm_medium),
      utmCampaign: cleanUtm(b.utm_campaign),
      createdAt: new Date(),
    })
    .onConflictDoNothing({ target: waitlist.email });

  return Response.json({ ok: true });
}
