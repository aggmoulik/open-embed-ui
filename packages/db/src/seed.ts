import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

async function seed() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const db = drizzle(client, { schema });

  console.log('Seeding database...');

  const userId = 'dev-user-001';
  const widgetId = 'dev-widget-001';
  const embedId = 'dev-embed-001';

  await db.insert(schema.users).values({
    id: userId,
    name: 'Dev User',
    email: 'dev@localhost.dev',
    githubId: '0',
    githubUsername: 'dev-user',
    image: 'https://avatars.githubusercontent.com/u/0',
  });

  const contributions = [
    // facebook/react (10 PRs)
    { id: 'pr-1001', title: 'fix: resolve hydration mismatch in concurrent mode', repo: 'facebook/react', mergedAt: '2025-01-15', additions: 42, deletions: 18, changedFiles: 3 },
    { id: 'pr-1002', title: 'feat: add useFormStatus hook for server actions', repo: 'facebook/react', mergedAt: '2025-03-22', additions: 187, deletions: 23, changedFiles: 7 },
    { id: 'pr-1003', title: 'fix: prevent memory leak in useEffect cleanup', repo: 'facebook/react', mergedAt: '2025-05-10', additions: 15, deletions: 8, changedFiles: 2 },
    { id: 'pr-1004', title: 'perf: optimize fiber reconciliation for large lists', repo: 'facebook/react', mergedAt: '2025-07-18', additions: 234, deletions: 102, changedFiles: 5 },
    { id: 'pr-1005', title: 'fix: correct suspense boundary fallback timing', repo: 'facebook/react', mergedAt: '2025-08-25', additions: 67, deletions: 31, changedFiles: 4 },
    { id: 'pr-1006', title: 'feat: implement async server component streaming', repo: 'facebook/react', mergedAt: '2025-10-01', additions: 445, deletions: 89, changedFiles: 12 },
    { id: 'pr-1007', title: 'docs: update concurrent features migration guide', repo: 'facebook/react', mergedAt: '2025-11-12', additions: 120, deletions: 45, changedFiles: 3 },
    { id: 'pr-1008', title: 'fix: race condition in startTransition batching', repo: 'facebook/react', mergedAt: '2025-12-05', additions: 28, deletions: 14, changedFiles: 2 },
    { id: 'pr-1009', title: 'test: add integration tests for RSC payload format', repo: 'facebook/react', mergedAt: '2026-01-20', additions: 310, deletions: 0, changedFiles: 8 },
    { id: 'pr-1010', title: 'fix: DevTools profiler crash on memo components', repo: 'facebook/react', mergedAt: '2026-03-14', additions: 55, deletions: 22, changedFiles: 3 },

    // vercel/next.js (10 PRs)
    { id: 'pr-2001', title: 'feat: support partial prerendering for dynamic routes', repo: 'vercel/next.js', mergedAt: '2025-02-05', additions: 312, deletions: 67, changedFiles: 12 },
    { id: 'pr-2002', title: 'fix: correct middleware redirect loop on edge runtime', repo: 'vercel/next.js', mergedAt: '2025-04-18', additions: 28, deletions: 12, changedFiles: 2 },
    { id: 'pr-2003', title: 'docs: update App Router migration guide for v15', repo: 'vercel/next.js', mergedAt: '2025-05-30', additions: 95, deletions: 41, changedFiles: 4 },
    { id: 'pr-2004', title: 'perf: tree-shake unused server component imports', repo: 'vercel/next.js', mergedAt: '2025-07-14', additions: 156, deletions: 89, changedFiles: 8 },
    { id: 'pr-2005', title: 'fix: image optimization AVIF fallback on Safari', repo: 'vercel/next.js', mergedAt: '2025-08-20', additions: 43, deletions: 11, changedFiles: 3 },
    { id: 'pr-2006', title: 'feat: add experimental after() API for background tasks', repo: 'vercel/next.js', mergedAt: '2025-10-08', additions: 278, deletions: 34, changedFiles: 9 },
    { id: 'pr-2007', title: 'fix: static export missing page metadata', repo: 'vercel/next.js', mergedAt: '2025-12-15', additions: 19, deletions: 7, changedFiles: 2 },
    { id: 'pr-2008', title: 'feat: turbopack dev CSS modules hot reload', repo: 'vercel/next.js', mergedAt: '2026-01-25', additions: 189, deletions: 56, changedFiles: 6 },
    { id: 'pr-2009', title: 'fix: parallel routes not matching catch-all segments', repo: 'vercel/next.js', mergedAt: '2026-02-18', additions: 37, deletions: 15, changedFiles: 4 },
    { id: 'pr-2010', title: 'chore: upgrade SWC bindings to 0.95', repo: 'vercel/next.js', mergedAt: '2026-03-22', additions: 12, deletions: 12, changedFiles: 1 },

    // openstatusHQ/openstatus (8 PRs)
    { id: 'pr-3001', title: 'feat: add custom status page monitors', repo: 'openstatusHQ/openstatus', mergedAt: '2025-03-12', additions: 220, deletions: 35, changedFiles: 9 },
    { id: 'pr-3002', title: 'fix: timezone handling in incident timeline', repo: 'openstatusHQ/openstatus', mergedAt: '2025-06-28', additions: 33, deletions: 19, changedFiles: 3 },
    { id: 'pr-3003', title: 'feat: webhook notifications for status changes', repo: 'openstatusHQ/openstatus', mergedAt: '2025-09-20', additions: 145, deletions: 10, changedFiles: 6 },
    { id: 'pr-3004', title: 'fix: cron monitor false positives on slow endpoints', repo: 'openstatusHQ/openstatus', mergedAt: '2025-11-05', additions: 52, deletions: 28, changedFiles: 4 },
    { id: 'pr-3005', title: 'feat: multi-region latency tracking dashboard', repo: 'openstatusHQ/openstatus', mergedAt: '2026-01-08', additions: 387, deletions: 45, changedFiles: 11 },
    { id: 'pr-3006', title: 'perf: optimize status page load with edge caching', repo: 'openstatusHQ/openstatus', mergedAt: '2026-02-14', additions: 76, deletions: 32, changedFiles: 5 },
    { id: 'pr-3007', title: 'fix: RSS feed missing latest incidents', repo: 'openstatusHQ/openstatus', mergedAt: '2026-03-01', additions: 21, deletions: 8, changedFiles: 2 },
    { id: 'pr-3008', title: 'docs: add API rate limiting documentation', repo: 'openstatusHQ/openstatus', mergedAt: '2026-03-27', additions: 88, deletions: 0, changedFiles: 3 },

    // tailwindlabs/tailwindcss (8 PRs)
    { id: 'pr-4001', title: 'feat: add container query support', repo: 'tailwindlabs/tailwindcss', mergedAt: '2025-02-20', additions: 523, deletions: 12, changedFiles: 8 },
    { id: 'pr-4002', title: 'fix: @apply inside @media not resolving variables', repo: 'tailwindlabs/tailwindcss', mergedAt: '2025-04-30', additions: 34, deletions: 18, changedFiles: 3 },
    { id: 'pr-4003', title: 'perf: reduce CSS output size with shared utility groups', repo: 'tailwindlabs/tailwindcss', mergedAt: '2025-07-22', additions: 198, deletions: 245, changedFiles: 6 },
    { id: 'pr-4004', title: 'feat: dynamic viewport units (dvh, dvw) support', repo: 'tailwindlabs/tailwindcss', mergedAt: '2025-09-15', additions: 67, deletions: 5, changedFiles: 4 },
    { id: 'pr-4005', title: 'fix: JIT engine ordering for pseudo-element variants', repo: 'tailwindlabs/tailwindcss', mergedAt: '2025-11-28', additions: 41, deletions: 22, changedFiles: 2 },
    { id: 'pr-4006', title: 'feat: oklch color function utilities', repo: 'tailwindlabs/tailwindcss', mergedAt: '2026-01-10', additions: 156, deletions: 0, changedFiles: 5 },
    { id: 'pr-4007', title: 'docs: v4 upgrade guide from v3 config', repo: 'tailwindlabs/tailwindcss', mergedAt: '2026-02-22', additions: 340, deletions: 120, changedFiles: 7 },
    { id: 'pr-4008', title: 'fix: purge safelist not working with regex patterns', repo: 'tailwindlabs/tailwindcss', mergedAt: '2026-03-18', additions: 23, deletions: 9, changedFiles: 2 },

    // drizzle-team/drizzle-orm (7 PRs)
    { id: 'pr-5001', title: 'feat: add $defaultFn for computed column defaults', repo: 'drizzle-team/drizzle-orm', mergedAt: '2025-01-28', additions: 178, deletions: 22, changedFiles: 5 },
    { id: 'pr-5002', title: 'fix: SQLite JSON mode serialization for nested objects', repo: 'drizzle-team/drizzle-orm', mergedAt: '2025-04-12', additions: 56, deletions: 34, changedFiles: 3 },
    { id: 'pr-5003', title: 'feat: Turso libSQL batch transaction support', repo: 'drizzle-team/drizzle-orm', mergedAt: '2025-06-18', additions: 289, deletions: 45, changedFiles: 8 },
    { id: 'pr-5004', title: 'fix: relation inference with composite primary keys', repo: 'drizzle-team/drizzle-orm', mergedAt: '2025-09-05', additions: 42, deletions: 19, changedFiles: 4 },
    { id: 'pr-5005', title: 'perf: query builder lazy evaluation for unused joins', repo: 'drizzle-team/drizzle-orm', mergedAt: '2025-12-20', additions: 134, deletions: 78, changedFiles: 6 },
    { id: 'pr-5006', title: 'feat: add selectDistinctOn for PostgreSQL', repo: 'drizzle-team/drizzle-orm', mergedAt: '2026-02-08', additions: 95, deletions: 0, changedFiles: 4 },
    { id: 'pr-5007', title: 'docs: migration guide from Prisma to Drizzle', repo: 'drizzle-team/drizzle-orm', mergedAt: '2026-03-25', additions: 445, deletions: 0, changedFiles: 5 },

    // shadcn-ui/ui (7 PRs)
    { id: 'pr-6001', title: 'feat: add date range picker component', repo: 'shadcn-ui/ui', mergedAt: '2025-03-08', additions: 267, deletions: 0, changedFiles: 5 },
    { id: 'pr-6002', title: 'fix: dialog close animation jank on mobile Safari', repo: 'shadcn-ui/ui', mergedAt: '2025-05-22', additions: 18, deletions: 6, changedFiles: 2 },
    { id: 'pr-6003', title: 'feat: resizable panels with drag handle', repo: 'shadcn-ui/ui', mergedAt: '2025-08-14', additions: 345, deletions: 12, changedFiles: 7 },
    { id: 'pr-6004', title: 'fix: combobox keyboard navigation in virtual lists', repo: 'shadcn-ui/ui', mergedAt: '2025-10-30', additions: 56, deletions: 23, changedFiles: 3 },
    { id: 'pr-6005', title: 'feat: sidebar component with collapsible sections', repo: 'shadcn-ui/ui', mergedAt: '2026-01-05', additions: 412, deletions: 0, changedFiles: 8 },
    { id: 'pr-6006', title: 'perf: lazy load heavy chart components', repo: 'shadcn-ui/ui', mergedAt: '2026-02-28', additions: 89, deletions: 45, changedFiles: 4 },
    { id: 'pr-6007', title: 'fix: toast stacking order with multiple portals', repo: 'shadcn-ui/ui', mergedAt: '2026-03-20', additions: 31, deletions: 14, changedFiles: 2 },
  ];

  for (const c of contributions) {
    const [repoOwner, repoName] = c.repo.split('/');
    await db.insert(schema.contributions).values({
      id: c.id,
      userId,
      title: c.title,
      url: `https://github.com/${c.repo}/pull/${c.id.replace('pr-', '')}`,
      repo: c.repo,
      repoOwner,
      repoName,
      githubId: c.id.replace('pr-', ''),
      mergedAt: new Date(c.mergedAt),
      additions: c.additions,
      deletions: c.deletions,
      changedFiles: c.changedFiles,
    });
  }

  await db.insert(schema.widgets).values({
    id: widgetId,
    userId,
    name: 'My OSS Contributions',
    description: 'Showcasing my open-source work across the ecosystem',
    config: {
      theme: 'system',
      layout: 'grid',
      timeRange: 'all',
      maxItems: 10,
    },
    isPublic: true,
  });

  await db.insert(schema.embeds).values({
    id: embedId,
    widgetId,
    embedCode: `<script async src="http://localhost:3000/widget.js" data-widget-id="${widgetId}"></script>`,
    allowedDomains: '*',
    viewCount: 0,
  });

  console.log('Seed complete!');
  console.log(`  User: ${userId} (dev@localhost.dev)`);
  console.log(`  Contributions: ${contributions.length}`);
  console.log(`  Widget: ${widgetId}`);
  console.log(`  Embed: ${embedId}`);

  client.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
