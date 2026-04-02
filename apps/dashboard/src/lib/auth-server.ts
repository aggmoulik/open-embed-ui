import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { accounts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return session;
}

export async function getGitHubAccessToken(userId: string): Promise<string | null> {
  const account = await db.query.accounts.findFirst({
    where: and(eq(accounts.userId, userId), eq(accounts.providerId, 'github')),
  });
  return account?.accessToken ?? null;
}

export function errorResponse(error: string, status: number) {
  return Response.json({ error, status }, { status });
}
