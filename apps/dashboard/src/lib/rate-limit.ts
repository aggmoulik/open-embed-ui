import { db, waitlistAttempts } from '@/lib/db';
import { and, eq, gte, lt, sql } from 'drizzle-orm';

// Per-IP rate limit for /api/waitlist. DB-backed so it works in every
// runtime (Next.js Node dev server, Cloudflare Workers in prod) without
// requiring a Worker rate-limit binding.
//
// Defaults: 5 attempts per IP per 10 minutes. Tuned for a low-volume
// pre-launch signup endpoint — generous enough to forgive a real user
// who fat-fingers an email a few times, strict enough to make scripted
// abuse expensive.
export const WAITLIST_RATE_WINDOW_MS = 10 * 60 * 1000;
export const WAITLIST_RATE_MAX = 5;

const IP_HASH_SALT = process.env.IP_HASH_SALT ?? 'open-embed-ui:waitlist:v1';

/**
 * SHA-256 hash of the request IP, salted. We never store the raw IP.
 * Salt is a build-time constant; rotating it invalidates existing
 * attempts (acceptable since the window is short).
 */
export async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(`${IP_HASH_SALT}:${ip}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Extract the client IP from a request. Honors Cloudflare's
 * `cf-connecting-ip` first, falls back to `x-forwarded-for` (first hop),
 * then `x-real-ip`. Returns `'0.0.0.0'` as a last-resort fallback so
 * unknown clients still get rate-limited (collectively).
 */
export function getClientIp(request: Request): string {
  const cf = request.headers.get('cf-connecting-ip');
  if (cf) return cf;
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real;
  return '0.0.0.0';
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Check whether `ipHash` is allowed another attempt, and (if so) record one.
 * Opportunistically prunes expired rows for this IP — keeps the table small
 * without a cron job at low volume.
 *
 * Atomicity caveat: this is two queries (count + insert). Under bursts it
 * can let one or two extra requests through; acceptable for waitlist abuse
 * prevention and avoids the complexity of upsert-with-counter logic.
 */
export async function checkAndRecordAttempt(ipHash: string): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - WAITLIST_RATE_WINDOW_MS);

  // Opportunistic prune (only this IP's old rows — cheap, uses the index).
  await db
    .delete(waitlistAttempts)
    .where(and(eq(waitlistAttempts.ipHash, ipHash), lt(waitlistAttempts.createdAt, windowStart)));

  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(waitlistAttempts)
    .where(
      and(eq(waitlistAttempts.ipHash, ipHash), gte(waitlistAttempts.createdAt, windowStart)),
    );

  const count = rows[0]?.count ?? 0;
  if (count >= WAITLIST_RATE_MAX) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(WAITLIST_RATE_WINDOW_MS / 1000),
    };
  }

  await db.insert(waitlistAttempts).values({
    id: crypto.randomUUID(),
    ipHash,
    createdAt: now,
  });

  return {
    allowed: true,
    remaining: Math.max(0, WAITLIST_RATE_MAX - count - 1),
    retryAfterSeconds: 0,
  };
}
