import { ImageResponse } from 'next/og';
import { db, users, contributions } from '@/lib/db';
import { eq, and, sql, isNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  const user = await db.query.users.findFirst({
    where: and(eq(users.githubUsername, username), isNull(users.deletedAt)),
  });

  if (!user) {
    return new Response('User not found', { status: 404 });
  }

  const result = await db
    .select({
      totalPRs: sql<number>`count(*)`,
      totalAdditions: sql<number>`coalesce(sum(${contributions.additions}), 0)`,
      totalDeletions: sql<number>`coalesce(sum(${contributions.deletions}), 0)`,
    })
    .from(contributions)
    .where(and(eq(contributions.userId, user.id), isNull(contributions.deletedAt)));

  const repos = await db
    .selectDistinct({ repo: contributions.repo })
    .from(contributions)
    .where(and(eq(contributions.userId, user.id), isNull(contributions.deletedAt)));

  const stats = {
    totalPRs: result[0]?.totalPRs ?? 0,
    totalAdditions: result[0]?.totalAdditions ?? 0,
    totalDeletions: result[0]?.totalDeletions ?? 0,
    totalRepos: repos.length,
  };

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Avatar + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {user.image && (
          <img
            src={user.image}
            alt=""
            width={96}
            height={96}
            style={{ borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)' }}
          />
        )}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '40px', fontWeight: 'bold', color: '#f8fafc' }}>
            {user.name}
          </span>
          <span style={{ fontSize: '20px', color: '#94a3b8' }}>@{username}</span>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          gap: '40px',
          marginTop: '40px',
          padding: '24px 48px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#a78bfa' }}>
            {stats.totalPRs}
          </span>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Merged PRs</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#a78bfa' }}>
            {stats.totalRepos}
          </span>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Repos</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#4ade80' }}>
            +{formatNumber(stats.totalAdditions)}
          </span>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Lines Added</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#f87171' }}>
            -{formatNumber(stats.totalDeletions)}
          </span>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Lines Removed</span>
        </div>
      </div>

      {/* Branding */}
      <span style={{ marginTop: '32px', fontSize: '14px', color: '#475569' }}>GitHub Embed UI</span>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
