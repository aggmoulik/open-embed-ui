import { getSession, getGitHubAccessToken, errorResponse } from '@/lib/auth-server';
import { syncGitHubContributions } from '@/lib/github-sync';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getSession();
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }

  const accessToken = await getGitHubAccessToken(session.user.id);
  if (!accessToken) {
    return errorResponse('GitHub account not linked or access token missing', 400);
  }

  try {
    const result = await syncGitHubContributions(session.user.id, accessToken);
    return Response.json({
      message: 'Sync completed',
      contributionsSynced: result.synced,
      reposScanned: result.repos,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'GitHub sync failed';
    console.error('[GitHub Sync Error]', error);
    return errorResponse(message, 502);
  }
}
