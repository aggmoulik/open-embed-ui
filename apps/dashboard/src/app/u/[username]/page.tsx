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

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          {user.image && safeImgSrc(user.image) && (
            <img
              src={safeImgSrc(user.image)}
              alt={user.name}
              className="border-border size-16 rounded-full border-2 sm:size-20"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{user.name}</h1>
            <a
              href={safeHref(`https://github.com/${encodeURIComponent(username)}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground text-sm hover:underline"
            >
              @{username}
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Merged PRs" value={stats.totalPRs} />
          <StatCard label="Repos" value={stats.totalRepos} />
          <StatCard
            label="Lines Added"
            value={formatNumber(stats.totalAdditions)}
            className="text-green-600"
          />
          <StatCard
            label="Lines Removed"
            value={formatNumber(stats.totalDeletions)}
            className="text-red-600"
          />
        </div>

        {/* Contributions */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">
            Merged Pull Requests ({userContributions.length})
          </h2>
          {userContributions.length > 0 ? (
            <WidgetRenderer
              contributions={userContributions}
              config={{ layout: 'grid', theme: 'system' }}
            />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center text-sm">
              No contributions yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <a
            href={
              safeHref(process.env.NEXT_PUBLIC_APP_URL) === '#'
                ? '/'
                : (process.env.NEXT_PUBLIC_APP_URL ?? '/')
            }
            className="text-muted-foreground text-xs hover:underline"
          >
            Powered by GitHub Embed UI
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className="bg-card rounded-lg border p-3 text-center">
      <div className={`text-xl font-bold ${className ?? ''}`}>{value}</div>
      <div className="text-muted-foreground text-xs">{label}</div>
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
