/**
 * Public embed payload endpoint — mirrors apps/embed-api/src/index.ts.
 *
 * SECURITY: This is the ONLY API route in the dashboard that returns
 * `Access-Control-Allow-Origin` to arbitrary third-party origins. Other
 * API routes are authenticated and rely on Next.js' default same-origin
 * behavior; do NOT copy this CORS pattern to any other route.
 *
 * CORS is computed per request — a blanket `*` would leak payloads of
 * widgets that have an origin allowlist set. See Phase 2 security doc
 * for the full contract; the worker (apps/embed-api) mirrors this
 * exactly and both must change together if the contract evolves.
 */

import { db, embeds, getEmbedPayload, parseOrigin, matchesAllowlist } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> },
) {
  const { widgetId } = await params;
  const originHeader = request.headers.get('origin');
  const parsedOrigin = parseOrigin(originHeader);

  const result = await getEmbedPayload(widgetId);
  if (!result) {
    return Response.json(
      { error: 'Widget not found' },
      { status: 404, headers: baseCorsHeaders(originHeader, null) },
    );
  }

  const { payload, allowedOrigins } = result;

  if (!matchesAllowlist(parsedOrigin, allowedOrigins)) {
    // 403 with no payload leak + Vary: Origin so CDN does not cross-serve.
    // Deliberately omit Access-Control-Allow-Origin so the browser blocks
    // the body from JS access.
    return Response.json(
      { error: 'Origin not authorized for this widget' },
      {
        status: 403,
        headers: { Vary: 'Origin' },
      },
    );
  }

  // Increment view count async (side effect specific to the live API; not part of the payload)
  incrementViewCount(widgetId);

  return Response.json(payload, {
    headers: {
      ...baseCorsHeaders(originHeader, allowedOrigins),
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

export async function OPTIONS(request: Request) {
  // Preflight always succeeds — actual enforcement happens in GET.
  const originHeader = request.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: baseCorsHeaders(originHeader, null, 'preflight'),
  });
}

function baseCorsHeaders(
  originHeader: string | null,
  allowedOrigins: string[] | null,
  mode: 'response' | 'preflight' = 'response',
): Record<string, string> {
  // Unrestricted widget (null allowlist) → `*`. Restricted widget with
  // a matched Origin → echo it. Preflight always echoes (enforcement is
  // on the GET response).
  const acao =
    mode === 'preflight'
      ? (originHeader ?? '*')
      : allowedOrigins && allowedOrigins.length > 0 && originHeader
        ? originHeader
        : '*';

  const h: Record<string, string> = {
    'Access-Control-Allow-Origin': acao,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
  if (mode === 'preflight') {
    h['Access-Control-Max-Age'] = '86400';
  }
  return h;
}

async function incrementViewCount(widgetId: string) {
  try {
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
