import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import type { WidgetConfig } from '@open-embed-ui/types';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  githubId: text('github_id').unique(),
  githubUsername: text('github_username'),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const widgets = sqliteTable('widgets', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  config: text('config', { mode: 'json' }).$type<WidgetConfig>(),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(true),
  // Per-widget origin allowlist enforced by the embed-api worker and the
  // dashboard's /api/embed route. Each entry is either an exact origin
  // (e.g. "https://aggmoulik.github.io") or a wildcard subdomain
  // (e.g. "*.aggmoulik.com"). When `null`, the widget is unrestricted —
  // any origin can fetch the payload (back-compat for existing widgets
  // and the default for new widgets unless the owner opts in).
  allowedOrigins: text('allowed_origins', { mode: 'json' }).$type<string[]>(),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const contributions = sqliteTable('contributions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  repo: text('repo').notNull(),
  repoOwner: text('repo_owner').notNull(),
  repoName: text('repo_name').notNull(),
  githubId: text('github_id').notNull(),
  mergedAt: integer('merged_at', { mode: 'timestamp' }),
  additions: integer('additions').notNull().default(0),
  deletions: integer('deletions').notNull().default(0),
  changedFiles: integer('changed_files').notNull().default(0),
  // User-authored metadata (features 11/13). All optional. Survive github-sync
  // via an explicit upsert `set` clause that omits these columns.
  titleOverride: text('title_override'),
  description: text('description'),
  blogUrl: text('blog_url'),
  blogOpenInNewTab: integer('blog_open_in_new_tab', { mode: 'boolean' }).notNull().default(true),
  // User-chosen labels (feature 13). Max 2 items from a predefined set.
  // Null = auto-detect from title at render time.
  labels: text('labels', { mode: 'json' }).$type<string[]>(),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const embeds = sqliteTable('embeds', {
  id: text('id').primaryKey(),
  widgetId: text('widget_id')
    .notNull()
    .references(() => widgets.id, { onDelete: 'cascade' }),
  embedCode: text('embed_code').notNull(),
  allowedDomains: text('allowed_domains'),
  viewCount: integer('view_count').notNull().default(0),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Feature 15: pre-launch waitlist.
// Idempotent on email (unique). Source = HTTP Referer; UTM fields are
// passed by the client from window.location.search on submit.
export const waitlist = sqliteTable('waitlist', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  source: text('source'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Per-IP rate-limit attempts log for /api/waitlist. Stores a salted hash
// of the request IP (never the raw IP). Old rows are pruned opportunistically
// by the rate-limit check itself; no cron required for low-volume traffic.
export const waitlistAttempts = sqliteTable(
  'waitlist_attempts',
  {
    id: text('id').primaryKey(),
    ipHash: text('ip_hash').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index('waitlist_attempts_ip_created_idx').on(table.ipHash, table.createdAt)],
);

export const accountDeletions = sqliteTable('account_deletions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  githubUsername: text('github_username'),
  githubId: text('github_id'),
  widgetCount: integer('widget_count').notNull().default(0),
  contributionCount: integer('contribution_count').notNull().default(0),
  accountCreatedAt: integer('account_created_at', { mode: 'timestamp' }),
  deletedAt: integer('deleted_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});
