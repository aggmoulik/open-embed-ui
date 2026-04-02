import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins/magic-link';
import { db, users, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

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
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        console.log(`\n  🔗 Magic link for ${email}:\n  ${url}\n`);
      },
    }),
  ],
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
