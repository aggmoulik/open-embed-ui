import { db, widgets, contributions, users, embeds } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';
import type { WidgetConfig } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ widgetId: string }> },
) {
  const { widgetId } = await params;

  const widget = await db.query.widgets.findFirst({
    where: and(eq(widgets.id, widgetId), eq(widgets.isPublic, true)),
  });

  if (!widget) {
    return Response.json({ error: 'Widget not found' }, { status: 404, headers: corsHeaders() });
  }

  const config: WidgetConfig = (widget.config as WidgetConfig) ?? {};

  const [user, prs] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, widget.userId) }),
    db
      .select()
      .from(contributions)
      .where(eq(contributions.userId, widget.userId))
      .orderBy(desc(contributions.mergedAt)),
  ]);

  // Apply filters
  let filtered = prs;

  if (config.timeRange && config.timeRange !== 'all') {
    const now = Date.now();
    const ranges = { week: 7, month: 30, year: 365 };
    const days = ranges[config.timeRange];
    const since = new Date(now - days * 24 * 60 * 60 * 1000);
    filtered = filtered.filter((c) => c.mergedAt && c.mergedAt >= since);
  }

  if (config.selectedPRs && config.selectedPRs.length > 0) {
    const selectedSet = new Set(config.selectedPRs);
    filtered = filtered.filter((c) => selectedSet.has(c.id));
  }

  if (config.maxItems) {
    filtered = filtered.slice(0, config.maxItems);
  }

  // Increment view count async
  incrementViewCount(widgetId);

  return Response.json(
    {
      widget: { name: widget.name, config },
      contributions: filtered.map((c) => ({
        id: c.id,
        title: c.title,
        url: c.url,
        repo: c.repo,
        repoOwner: c.repoOwner,
        repoName: c.repoName,
        mergedAt: c.mergedAt?.toISOString() ?? null,
        additions: c.additions,
        deletions: c.deletions,
        changedFiles: c.changedFiles,
      })),
      user: user
        ? { name: user.name, image: user.image, githubUsername: user.githubUsername }
        : null,
    },
    {
      headers: {
        ...corsHeaders(),
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    },
  );
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
