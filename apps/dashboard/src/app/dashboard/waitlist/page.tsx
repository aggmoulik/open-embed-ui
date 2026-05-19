import { notFound } from 'next/navigation';
import { desc } from 'drizzle-orm';
import { Download } from 'lucide-react';
import { db, waitlist } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { isAdmin } from '@/lib/admin';
import { PageHeader } from '@/components/page-header';
import { ApprovalToggle } from './_components/approval-toggle';

export const dynamic = 'force-dynamic';

export default async function WaitlistAdminPage() {
  const session = await getSession();
  if (!isAdmin(session)) notFound();

  const rows = await db.select().from(waitlist).orderBy(desc(waitlist.createdAt)).limit(500);
  const approvedCount = rows.filter((r) => r.approvedAt != null).length;
  const pendingCount = rows.length - approvedCount;

  const countLabel =
    rows.length === 0
      ? 'no signups yet'
      : `${rows.length.toLocaleString()} ${rows.length === 1 ? 'signup' : 'signups'} · ${approvedCount} approved · ${pendingCount} pending${
          rows.length === 500 ? ' (latest 500)' : ''
        }`;

  return (
    <div className="mx-auto max-w-[1240px]">
      <PageHeader
        num="05"
        eyebrow="admin · waitlist"
        title="Waitlist signups."
        lead={countLabel}
        actions={
          <a
            href="/dashboard/waitlist/export"
            className="border-foreground bg-foreground text-background hover:bg-foreground/90 inline-flex h-[30px] items-center gap-2 rounded-md border px-3 font-mono text-[12px] font-medium transition-colors"
          >
            <Download className="size-3.5" strokeWidth={1.75} />
            Export CSV
          </a>
        }
      />

      {rows.length === 0 ? (
        <div className="border-border bg-muted/20 text-muted-foreground rounded-xl border border-dashed py-16 text-center font-mono text-[13px]">
          <span className="text-brand">●</span> When people join the waitlist from the landing page,
          they&apos;ll show up here.
        </div>
      ) : (
        <div className="border-border bg-background overflow-hidden rounded-xl border">
          <div className="border-border bg-muted/30 flex items-center justify-between border-b border-dashed px-4 py-2">
            <span className="text-muted-foreground font-mono text-[10px] tracking-[0.08em] uppercase">
              // signups
            </span>
            <span className="text-muted-foreground font-mono text-[10px] tracking-[0.08em] uppercase">
              {rows.length} rows
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-[12px]">
              <thead className="border-border bg-muted/20 text-muted-foreground/80 border-b">
                <tr>
                  <Th>Status</Th>
                  <Th>Email</Th>
                  <Th>Source</Th>
                  <Th>UTM (src · med · cmp)</Th>
                  <Th>Joined</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const utmCombined = [row.utmSource, row.utmMedium, row.utmCampaign]
                    .filter(Boolean)
                    .join(' · ');
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-muted/30 ${
                        i === rows.length - 1 ? '' : 'border-border border-b border-dashed'
                      }`}
                    >
                      <Td>
                        <ApprovalToggle
                          id={row.id}
                          email={row.email}
                          initialApproved={row.approvedAt != null}
                        />
                      </Td>
                      <Td className="text-foreground font-medium">{row.email}</Td>
                      <Td
                        className="text-muted-foreground max-w-xs truncate"
                        title={row.source ?? ''}
                      >
                        {row.source ?? <span className="text-muted-foreground/40">—</span>}
                      </Td>
                      <Td className="text-muted-foreground">
                        {utmCombined ? (
                          utmCombined
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </Td>
                      <Td className="text-muted-foreground/80 whitespace-nowrap">
                        {formatDate(row.createdAt)}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-[10px] font-medium tracking-[0.08em] uppercase">
      {children}
    </th>
  );
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
    <td className={`px-4 py-3 ${className ?? ''}`} title={title}>
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
