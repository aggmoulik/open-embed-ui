import { notFound } from 'next/navigation';
import { desc, isNull } from 'drizzle-orm';
import { db, waitlist } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { isAdmin } from '@/lib/admin';
import { Button } from '@open-embed-ui/ui/components/button';
import { Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function WaitlistAdminPage() {
  const session = await getSession();
  if (!isAdmin(session)) notFound();

  // Suppress unused-var warning on isNull — kept around for future soft-delete column.
  void isNull;

  const rows = await db.select().from(waitlist).orderBy(desc(waitlist.createdAt)).limit(500);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Waitlist</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {rows.length === 0
              ? 'No signups yet.'
              : `${rows.length.toLocaleString()} ${rows.length === 1 ? 'signup' : 'signups'}${
                  rows.length === 500 ? ' (showing latest 500)' : ''
                }`}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <a href="/dashboard/waitlist/export">
            <Download className="size-4" />
            Export CSV
          </a>
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center text-sm">
          When people join the waitlist from the landing page, they&apos;ll show up here.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
              <tr>
                <Th>Email</Th>
                <Th>Referrer</Th>
                <Th>Source</Th>
                <Th>Medium</Th>
                <Th>Campaign</Th>
                <Th>Joined</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 border-t">
                  <Td className="font-medium">{row.email}</Td>
                  <Td className="text-muted-foreground max-w-xs truncate" title={row.source ?? ''}>
                    {row.source ?? '—'}
                  </Td>
                  <Td className="text-muted-foreground">{row.utmSource ?? '—'}</Td>
                  <Td className="text-muted-foreground">{row.utmMedium ?? '—'}</Td>
                  <Td className="text-muted-foreground">{row.utmCampaign ?? '—'}</Td>
                  <Td className="text-muted-foreground whitespace-nowrap">
                    {formatDate(row.createdAt)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 text-left font-medium">{children}</th>;
}

function Td({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <td className={`px-4 py-2.5 ${className ?? ''}`} title={title}>
      {children}
    </td>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
