import { db, embeds, getEmbedPayload } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ widgetId: string }> },
) {
  const { widgetId } = await params;

  const payload = await getEmbedPayload(widgetId);
  if (!payload) {
    return Response.json({ error: 'Widget not found' }, { status: 404, headers: corsHeaders() });
  }

  // Increment view count async (side effect specific to the live API; not part of the payload)
  incrementViewCount(widgetId);

  return Response.json(payload, {
    headers: {
      ...corsHeaders(),
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
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
