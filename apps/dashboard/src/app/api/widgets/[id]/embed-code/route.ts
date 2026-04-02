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

  return Response.json({
    script: `<script async src="${baseUrl}/widget.js" data-widget-id="${widget.id}"></script>`,
    npm: `import { mount } from '@github-embed-ui/widget';\nmount('#my-widget', { widgetId: '${widget.id}', baseUrl: '${baseUrl}' });`,
  });
}
