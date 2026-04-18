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
import { cors } from 'hono/cors';

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

app.use(
  '/api/embed/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 86400,
  }),
);

app.get('/api/embed/:widgetId', async (c) => {
  const widgetId = c.req.param('widgetId');

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
  const { getEmbedPayload } = await import('@github-embed-ui/db');
  const payload = await getEmbedPayload(widgetId);

  if (!payload) {
    return c.json({ error: 'Widget not found' }, 404);
  }

  // Fire-and-forget view count update (non-critical)
  c.executionCtx.waitUntil(incrementViewCount(widgetId));

  return c.json(payload, 200, {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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
    const { db, embeds } = await import('@github-embed-ui/db');
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
