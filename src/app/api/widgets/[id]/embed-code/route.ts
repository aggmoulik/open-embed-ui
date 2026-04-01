import type { NextRequest } from 'next/server';
import { db } from '@/db';
import { widgets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession, errorResponse } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return errorResponse('Unauthorized', 401);

  const { id } = await params;

  const widget = await db.query.widgets.findFirst({
    where: and(eq(widgets.id, id), eq(widgets.userId, session.user.id)),
  });

  if (!widget) return errorResponse('Widget not found', 404);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const embedUrl = `${baseUrl}/embed/${widget.id}`;

  return Response.json({
    directUrl: embedUrl,
    iframe: `<iframe src="${embedUrl}" width="100%" height="400" frameborder="0" style="border:none;border-radius:8px;"></iframe>`,
    script: `<div id="geu-${widget.id}"></div>\n<script src="${baseUrl}/embed.js" data-widget="${widget.id}" async></script>`,
  });
}
