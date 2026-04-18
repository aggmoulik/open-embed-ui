import { createAuthClient } from 'better-auth/react';
import { magicLinkClient } from 'better-auth/client/plugins';

// Magic link is DEV-ONLY (see apps/dashboard/src/lib/auth.ts comment).
// Keep the client plugin in sync with the server registration.
const isDev = process.env.NODE_ENV !== 'production';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  plugins: isDev ? [magicLinkClient()] : [],
});
