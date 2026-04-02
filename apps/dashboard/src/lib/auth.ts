import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as schema from '@/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          if (account.providerId === 'github' && account.accessToken) {
            try {
              const res = await fetch('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${account.accessToken}` },
              });
              if (res.ok) {
                const ghUser = await res.json();
                await db
                  .update(users)
                  .set({
                    githubUsername: ghUser.login,
                    githubId: String(ghUser.id),
                    image: ghUser.avatar_url,
                    updatedAt: new Date(),
                  })
                  .where(eq(users.id, account.userId));
              }
            } catch {
              // Non-critical
            }
          }
        },
      },
    },
  },
});
