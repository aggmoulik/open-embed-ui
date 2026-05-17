import { desc } from 'drizzle-orm';
import { db, waitlist } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

const CSV_HEADER = ['email', 'source', 'utm_source', 'utm_medium', 'utm_campaign', 'created_at'];

// RFC 4180: wrap in quotes if value contains comma, quote, or newline.
// Escape embedded quotes by doubling them.
function csvCell(value: string | null | undefined): string {
  if (value == null) return '';
  const needsQuoting = /[",\r\n]/.test(value);
  if (!needsQuoting) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await getSession();
  if (!isAdmin(session)) {
    return new Response('Not found', { status: 404 });
  }

  const rows = await db.select().from(waitlist).orderBy(desc(waitlist.createdAt));

  const lines = [CSV_HEADER.join(',')];
  for (const row of rows) {
    lines.push(
      [
        csvCell(row.email),
        csvCell(row.source),
        csvCell(row.utmSource),
        csvCell(row.utmMedium),
        csvCell(row.utmCampaign),
        csvCell(row.createdAt.toISOString()),
      ].join(','),
    );
  }
  // RFC 4180 prefers CRLF line endings.
  const body = lines.join('\r\n') + '\r\n';

  const today = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="waitlist-${today}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
