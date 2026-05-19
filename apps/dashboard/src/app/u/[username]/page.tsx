import { db, users, contributions } from '@/lib/db';
import { eq, and, desc, sql, isNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { WidgetRenderer } from '@/components/widget-preview/widget-renderer';
import type { Contribution } from '@/types';
import { safeHref, safeImgSrc } from '@/lib/validation/contribution';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await db.query.users.findFirst({
    where: and(eq(users.githubUsername, username), isNull(users.deletedAt)),
  });

  if (!user) return { title: 'Profile Not Found' };

  const stats = await getStats(user.id);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  return {
    title: `${user.name}'s Open Source Contributions`,
    description: `${user.name} has ${stats.totalPRs} merged PRs across ${stats.totalRepos} public repositories.`,
    openGraph: {
      title: `${user.name}'s Open Source Contributions`,
      description: `${stats.totalPRs} merged PRs across ${stats.totalRepos} repos`,
      images: [`${baseUrl}/api/og/${username}`],
      type: 'profile',
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  const user = await db.query.users.findFirst({
    where: and(eq(users.githubUsername, username), isNull(users.deletedAt)),
  });

  if (!user) return notFound();

  const userContributions = (await db
    .select()
    .from(contributions)
    .where(and(eq(contributions.userId, user.id), isNull(contributions.deletedAt)))
    .orderBy(desc(contributions.mergedAt))) as Contribution[];

  const stats = await getStats(user.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '/';
  const homeHref = safeHref(appUrl) === '#' ? '/' : appUrl;

  return (
    <div className="bg-background min-h-screen">
      <header className="border-border bg-background/75 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-md backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-7">
          <a
            href={homeHref}
            className="flex items-center gap-2.5 font-mono text-[13px] font-semibold tracking-[-0.01em]"
          >
            <span
              aria-hidden="true"
              className="bg-foreground text-background grid size-[22px] place-items-center rounded-[5px] font-mono text-[12px] font-bold"
            >
              ⌥
            </span>
            <span>openembed/ui</span>
          </a>
          <span className="text-muted-foreground font-mono text-[11px]">public profile</span>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border pb-12 pt-16">
        <div className="marketing-grid-bg" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1100px] px-7">
          <div className="marketing-section-eyebrow text-muted-foreground mb-4 inline-block font-mono text-[11px] uppercase tracking-[0.08em]">
            01 · open-source contributions
          </div>

          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {user.image && safeImgSrc(user.image) && (
              <img
                src={safeImgSrc(user.image)}
                alt={user.name}
                className="border-border size-20 shrink-0 rounded-full border-2 sm:size-24"
              />
            )}
            <div>
              <h1 className="font-sans text-[36px] font-semibold leading-[1.05] tracking-[-0.025em] sm:text-[44px]">
                {user.name}
              </h1>
              <a
                href={safeHref(`https://github.com/${encodeURIComponent(username)}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground mt-1 inline-block font-mono text-[14px] underline-offset-4 transition-colors hover:underline"
              >
                @{username}
              </a>
            </div>
          </div>

          {/* Stats grid — bordered cells matching the landing's FeaturesGrid */}
          <div className="border-border bg-background mt-9 grid grid-cols-2 overflow-hidden rounded-xl border sm:grid-cols-4">
            <StatCell label="Merged PRs" value={stats.totalPRs} />
            <StatCell label="Repositories" value={stats.totalRepos} />
            <StatCell
              label="Lines added"
              value={formatNumber(stats.totalAdditions)}
              accent="text-brand"
            />
            <StatCell
              label="Lines removed"
              value={formatNumber(stats.totalDeletions)}
              accent="text-danger"
              isLast
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-[1100px] px-7">
          <div className="mb-9">
            <div className="marketing-section-eyebrow text-muted-foreground mb-3 inline-block font-mono text-[11px] uppercase tracking-[0.08em]">
              02 · merged pull requests · {userContributions.length}
            </div>
            <h2 className="font-sans text-[28px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[32px]">
              The shipped list.
            </h2>
          </div>

          {userContributions.length > 0 ? (
            <WidgetRenderer
              contributions={userContributions}
              config={{ layout: 'grid', theme: 'system' }}
            />
          ) : (
            <div className="border-border bg-muted/20 text-muted-foreground rounded-xl border border-dashed py-16 text-center font-mono text-[13px]">
              <span className="text-brand">●</span> No contributions synced yet.
            </div>
          )}
        </div>
      </section>

      <footer className="border-border bg-muted/40 py-9">
        <div className="text-muted-foreground/80 mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-7 font-mono text-[11px]">
          <span>
            <span className="bg-foreground text-background mr-1 inline-grid size-3.5 place-items-center rounded-[3px] align-text-bottom font-mono text-[9px] font-bold">
              ⌥
            </span>
            powered by{' '}
            <a href={homeHref} className="text-foreground underline underline-offset-2">
              openembed/ui
            </a>
          </span>
          <span>build your own at {homeHref.replace(/^https?:\/\//, '')}</span>
        </div>
      </footer>
    </div>
  );
}

function StatCell({
  label,
  value,
  accent,
  isLast,
}: {
  label: string;
  value: string | number;
  accent?: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`border-border p-5 ${isLast ? '' : 'sm:border-r'} ${isLast ? '' : 'max-sm:border-b'} max-sm:[&:nth-child(odd)]:sm:border-r-0 max-sm:[&:nth-child(odd)]:border-r max-sm:[&:nth-child(2n)]:border-r-0`}
    >
      <div className="text-muted-foreground/70 mb-1 font-mono text-[10px] uppercase tracking-[0.08em]">
        {label}
      </div>
      <div className={`font-sans text-[24px] font-semibold tracking-[-0.025em] ${accent ?? ''}`}>
        {value}
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

async function getStats(userId: string) {
  const result = await db
    .select({
      totalPRs: sql<number>`count(*)`,
      totalAdditions: sql<number>`coalesce(sum(${contributions.additions}), 0)`,
      totalDeletions: sql<number>`coalesce(sum(${contributions.deletions}), 0)`,
    })
    .from(contributions)
    .where(and(eq(contributions.userId, userId), isNull(contributions.deletedAt)));

  const repos = await db
    .selectDistinct({ repo: contributions.repo })
    .from(contributions)
    .where(and(eq(contributions.userId, userId), isNull(contributions.deletedAt)));

  return {
    totalPRs: result[0]?.totalPRs ?? 0,
    totalAdditions: result[0]?.totalAdditions ?? 0,
    totalDeletions: result[0]?.totalDeletions ?? 0,
    totalRepos: repos.length,
  };
}
