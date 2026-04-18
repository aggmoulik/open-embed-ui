import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins/magic-link';
import { db, users, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

const isDev = process.env.NODE_ENV !== 'production';

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
  // Explicit trusted origins for CSRF / callback / redirect validation.
  // Without this, better-auth derives only from BETTER_AUTH_URL — explicit
  // is clearer and makes localhost dev work without surprises.
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    ...(isDev ? ['http://localhost:3000'] : []),
  ],
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  // Magic link is DEV-ONLY. The sendMagicLink callback logs the URL to
  // stdout, which would leak valid auth tokens through Cloudflare logs
  // in production. Login UI is also dev-gated (apps/dashboard/src/app/
  // login/page.tsx) but the API endpoint must also be removed in prod.
  plugins: isDev
    ? [
        magicLink({
          sendMagicLink: async ({ email, url }) => {
            console.log(`\n  🔗 Magic link for ${email}:\n  ${url}\n`);
          },
        }),
      ]
    : [],
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
