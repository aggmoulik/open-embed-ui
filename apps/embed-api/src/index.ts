/**
 * Slim Cloudflare Worker — serves the public widget API + the widget bundle.
 *
 * Routes:
 *   GET  /api/embed/:widgetId   → JSON payload (same shape as dashboard's API)
 *   GET  /widget.js             → static asset (handled by ASSETS binding fallthrough)
 *
 * Secrets (set via `wrangler secret put`):
 *   TURSO_DATABASE_URL
 *   TURSO_AUTH_TOKEN
 */

import { Hono } from 'hono';
import { parseOrigin, matchesAllowlist } from '@open-embed-ui/db';

interface RateLimit {
  limit(opts: { key: string }): Promise<{ success: boolean }>;
}

interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  ASSETS: Fetcher;
  EMBED_RATE_LIMITER: RateLimit;
  WIDGET_RATE_LIMITER: RateLimit;
}

const app = new Hono<{ Bindings: Env }>();

// Bridge Workers env → process.env so packages/db (which reads process.env)
// works unchanged. Runs once per isolate; nodejs_compat provides process.env.
app.use('*', async (c, next) => {
  const env = process.env as Record<string, string | undefined>;
  if (!env.TURSO_DATABASE_URL) env.TURSO_DATABASE_URL = c.env.TURSO_DATABASE_URL;
  if (!env.TURSO_AUTH_TOKEN) env.TURSO_AUTH_TOKEN = c.env.TURSO_AUTH_TOKEN;
  await next();
});

// SECURITY: CORS is handled per-request in the route handler so we can
// set `Access-Control-Allow-Origin` dynamically based on the widget's
// allowedOrigins allowlist. A blanket middleware with `origin: '*'`
// would leak payloads of restricted widgets cross-origin.
//
// For widgets with NULL allowedOrigins (unrestricted), we still return
// `*`. For restricted widgets, we reflect the matched Origin header
// only if it's in the allowlist.
//
// OPTIONS preflight is handled below as a dedicated route.
//
// Mirror of apps/dashboard/src/app/api/embed/[widgetId]/route.ts — keep
// the access-control contract in lock-step.

// OPTIONS preflight for /api/embed/*. We don't know the widget's
// allowlist here (URL parse would add latency to every preflight), so
// echo the Origin header back. The actual GET handler enforces the
// allowlist, so a preflight "success" does not grant access.
app.options('/api/embed/*', (c) => {
  const origin = c.req.header('origin') ?? '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    },
  });
});

app.get('/api/embed/:widgetId', async (c) => {
  const widgetId = c.req.param('widgetId');
  const originHeader = c.req.header('origin') ?? null;
  const parsedOrigin = parseOrigin(originHeader);

  // Two-layer rate limiting before any DB work.
  // Per-IP first (cheaper to fail fast on brute scrapers).
  const ip = c.req.header('cf-connecting-ip') ?? '0.0.0.0';
  const ipResult = await c.env.EMBED_RATE_LIMITER.limit({ key: ip });
  if (!ipResult.success) {
    return c.json({ error: 'Too many requests' }, 429, { 'Retry-After': '60' });
  }

  // Per-widget-ID second (prevents amplification via a single popular widget).
  const widgetResult = await c.env.WIDGET_RATE_LIMITER.limit({ key: widgetId });
  if (!widgetResult.success) {
    return c.json({ error: 'Widget rate limit exceeded' }, 429, { 'Retry-After': '60' });
  }

  // Lazy-load to avoid initializing drizzle/libsql at module top-level
  const { getEmbedPayload } = await import('@open-embed-ui/db');
  const result = await getEmbedPayload(widgetId);

  if (!result) {
    return c.json({ error: 'Widget not found' }, 404);
  }

  const { payload, allowedOrigins } = result;

  // Enforce per-widget origin allowlist.
  if (!matchesAllowlist(parsedOrigin, allowedOrigins)) {
    // 403 — origin not authorized. Deliberately no payload leak.
    // `Vary: Origin` ensures the CF edge cache does not serve this
    // rejection to an allowed origin.
    return new Response(JSON.stringify({ error: 'Origin not authorized for this widget' }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        Vary: 'Origin',
        // No ACAO header — browser blocks the 403 body from JS access.
      },
    });
  }

  // Compute the exact ACAO value. Widgets default-deny — by the time
  // we reach this point, allowedOrigins is non-empty AND the origin
  // matched. Echo the request's Origin (or `*` only as a defensive
  // fallback for non-browser callers without an Origin header).
  const acao = originHeader ?? '*';

  // Fire-and-forget view count update (non-critical)
  c.executionCtx.waitUntil(incrementViewCount(widgetId));

  return c.json(payload, 200, {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    'Access-Control-Allow-Origin': acao,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    // Essential: CF edge caches vary per Origin so a restricted-widget
    // response is not served cross-origin to a different requester.
    Vary: 'Origin',
  });
});

app.get('/', (c) =>
  c.text('github-embed-ui — widget API. See /api/embed/:widgetId or /widget.js', 200),
);

// Everything else (notably /widget.js) falls through to the ASSETS binding
// because wrangler.jsonc has assets.binding = ASSETS without not_found_handling.
// Hono returns 404 here; Cloudflare Assets serves the static file before this runs.
app.notFound((c) => c.text('Not found', 404));

async function incrementViewCount(widgetId: string) {
  try {
    const { db, embeds } = await import('@open-embed-ui/db');
    const { eq } = await import('drizzle-orm');
    const embed = await db.query.embeds.findFirst({ where: eq(embeds.widgetId, widgetId) });
    if (embed) {
      await db
        .update(embeds)
        .set({ viewCount: embed.viewCount + 1, updatedAt: new Date() })
        .where(eq(embeds.id, embed.id));
    }
  } catch {
    // Non-critical
  }
}

export default app;
