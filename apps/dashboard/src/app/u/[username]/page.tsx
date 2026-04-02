import { db } from '@github-embed-ui/db';
import { users, contributions } from '@github-embed-ui/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { WidgetRenderer } from '@/components/widget-preview/widget-renderer';
import type { Contribution } from '@/types';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await db.query.users.findFirst({
    where: eq(users.githubUsername, username),
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
    where: eq(users.githubUsername, username),
  });

  if (!user) return notFound();

  const userContributions = (await db
    .select()
    .from(contributions)
    .where(eq(contributions.userId, user.id))
    .orderBy(desc(contributions.mergedAt))) as Contribution[];

  const stats = await getStats(user.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          {user.image && (
            <img
              src={user.image}
              alt={user.name}
              className="size-16 rounded-full border-2 border-border sm:size-20"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{user.name}</h1>
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:underline"
            >
              @{username}
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Merged PRs" value={stats.totalPRs} />
          <StatCard label="Repos" value={stats.totalRepos} />
          <StatCard label="Lines Added" value={formatNumber(stats.totalAdditions)} className="text-green-600" />
          <StatCard label="Lines Removed" value={formatNumber(stats.totalDeletions)} className="text-red-600" />
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
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground">
              No contributions yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <a
            href={process.env.NEXT_PUBLIC_APP_URL ?? '/'}
            className="text-xs text-muted-foreground hover:underline"
          >
            Powered by GitHub Embed UI
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <div className={`text-xl font-bold ${className ?? ''}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
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
    .where(eq(contributions.userId, userId));

  const repos = await db
    .selectDistinct({ repo: contributions.repo })
    .from(contributions)
    .where(eq(contributions.userId, userId));

  return {
    totalPRs: result[0]?.totalPRs ?? 0,
    totalAdditions: result[0]?.totalAdditions ?? 0,
    totalDeletions: result[0]?.totalDeletions ?? 0,
    totalRepos: repos.length,
  };
}
