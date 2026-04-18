export * as schema from './schema';
export { users, sessions, accounts, verifications, widgets, contributions, embeds, accountDeletions } from './schema';

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

function createDb() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return drizzle(client, { schema });
}

let _db: ReturnType<typeof createDb> | undefined;

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop, receiver) {
    if (!_db) {
      _db = createDb();
    }
    return Reflect.get(_db, prop, receiver);
  },
});

// Shared queries (single source of truth for API + CLI exports)
export { getEmbedPayload } from './queries/embed';
export type {
  EmbedPayload,
  EmbedPayloadResult,
  SerializedContribution,
  GetEmbedPayloadOptions,
} from './queries/embed';

// Origin allowlist matcher — used by embed-api worker and dashboard /api/embed
export { parseOrigin, matchesAllowlist } from './lib/origin-match';
export type { ParsedOrigin } from './lib/origin-match';
