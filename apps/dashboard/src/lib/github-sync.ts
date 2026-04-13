import { createOctokitClient } from '@/lib/github';
import { db, contributions, users } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';

/**
 * Syncs merged PRs authored by the user across ALL public repos on GitHub.
 *
 * Uses GitHub's GraphQL Search API with the query:
 *   `is:pr is:merged is:public author:{username} archived:false`
 *
 * This finds merged PRs everywhere — not just repos the user owns/is a member of.
 * Covers contributions to external orgs, forked repos, etc.
 *
 * Typically ~3-5 GraphQL calls total (100 PRs per page, ~1 rate limit point each).
 */
export async function syncGitHubContributions(userId: string, accessToken: string) {
  const octokit = createOctokitClient(accessToken);

  const { data: ghUser } = await octokit.rest.users.getAuthenticated();
  const username = ghUser.login;

  // Backfill githubUsername if missing
  await db
    .update(users)
    .set({
      githubUsername: username,
      githubId: String(ghUser.id),
      image: ghUser.avatar_url,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  const allMergedPRs: NewContribution[] = [];
  const seenRepos = new Set<string>();

  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const result: SearchResponse = await octokit.graphql(MERGED_PRS_SEARCH, {
      searchQuery: `is:pr is:merged is:public author:${username} archived:false`,
      after: cursor,
    });

    logGraphQLRateLimit(result.rateLimit);

    for (const node of result.search.nodes) {
      const repo = node.repository;
      const repoFullName = `${repo.owner.login}/${repo.name}`;
      seenRepos.add(repoFullName);

      allMergedPRs.push({
        title: node.title,
        url: node.url,
        repo: repoFullName,
        repoOwner: repo.owner.login,
        repoName: repo.name,
        githubId: node.databaseId.toString(),
        mergedAt: new Date(node.mergedAt),
        additions: node.additions,
        deletions: node.deletions,
        changedFiles: node.changedFiles,
      });
    }

    hasNextPage = result.search.pageInfo.hasNextPage;
    cursor = result.search.pageInfo.endCursor;
  }

  // Upsert contributions — feature 11.
  //
  // Replaced the previous delete+insert flow because it wiped user-authored
  // metadata (description, blog_url, blog_open_in_new_tab) on every sync.
  //
  // The `set` clause below MUST only contain GitHub-sourced columns. Do not
  // add `description`, `blogUrl`, `blogOpenInNewTab`, or `labels` here —
  // those are user-authored and must survive re-syncs untouched. There is a
  // regression test that asserts this; if you change this code, make sure
  // the test still passes.
  //
  // Side-effect: PRs deleted from GitHub will linger as orphaned rows. This
  // is an acceptable trade-off — PRs rarely get deleted upstream and the
  // previous flow had no graceful "this was deleted" affordance either. A
  // future feature can add an opt-in `?prune=1` mode that soft-deletes rows
  // not seen in the current sync.
  if (allMergedPRs.length > 0) {
    for (let i = 0; i < allMergedPRs.length; i += 100) {
      const batch = allMergedPRs.slice(i, i + 100).map((c) => ({
        ...c,
        userId,
        id: `pr-${c.githubId}`,
      }));
      await db
        .insert(contributions)
        .values(batch)
        .onConflictDoUpdate({
          target: contributions.id,
          set: {
            title: sql`excluded.title`,
            url: sql`excluded.url`,
            repo: sql`excluded.repo`,
            repoOwner: sql`excluded.repo_owner`,
            repoName: sql`excluded.repo_name`,
            mergedAt: sql`excluded.merged_at`,
            additions: sql`excluded.additions`,
            deletions: sql`excluded.deletions`,
            changedFiles: sql`excluded.changed_files`,
            updatedAt: new Date(),
          },
        });
    }
  }

  return { synced: allMergedPRs.length, repos: seenRepos.size };
}

/**
 * GraphQL Search query — finds all merged PRs by the user across all of GitHub.
 *
 * The $searchQuery variable is built as:
 *   `is:pr is:merged is:public author:{username} archived:false`
 *
 * Search qualifiers:
 *   - is:pr         → only pull requests (not issues)
 *   - is:merged     → only merged PRs
 *   - is:public     → only from public repos (no private)
 *   - author:{user} → only PRs authored by the logged-in user
 *   - archived:false → exclude archived repos
 *
 * Each result node returns the PR details + nested repository info.
 * Paginated with 100 results per page using cursor-based pagination.
 */
const MERGED_PRS_SEARCH = `
  query($searchQuery: String!, $after: String) {
    search(
      query: $searchQuery
      type: ISSUE
      first: 100
      after: $after
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ... on PullRequest {
          databaseId
          title
          url
          mergedAt
          additions
          deletions
          changedFiles
          repository {
            name
            owner { login }
          }
        }
      }
    }
    rateLimit {
      remaining
      limit
      resetAt
      cost
    }
  }
`;

interface NewContribution {
  title: string;
  url: string;
  repo: string;
  repoOwner: string;
  repoName: string;
  githubId: string;
  mergedAt: Date;
  additions: number;
  deletions: number;
  changedFiles: number;
}

interface SearchResponse {
  search: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: Array<{
      databaseId: number;
      title: string;
      url: string;
      mergedAt: string;
      additions: number;
      deletions: number;
      changedFiles: number;
      repository: {
        name: string;
        owner: { login: string };
      };
    }>;
  };
  rateLimit: RateLimitInfo;
}

interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetAt: string;
  cost: number;
}

function logGraphQLRateLimit(rateLimit: RateLimitInfo) {
  console.log(
    `[GitHub GraphQL] Rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining (cost: ${rateLimit.cost}), resets at ${rateLimit.resetAt}`,
  );

  if (rateLimit.remaining < 100) {
    console.warn(`[GitHub GraphQL] Rate limit low: ${rateLimit.remaining} points remaining`);
  }
}
