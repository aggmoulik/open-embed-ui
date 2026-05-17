-- Feature 15: pre-launch waitlist + per-IP rate-limit attempts log.
--
-- waitlist: email-keyed signup table. Idempotent on email (unique). Source =
--   HTTP Referer captured server-side; utm_* are passed by the client from
--   window.location.search on submit.
--
-- waitlist_attempts: rate-limit attempts log. Stores a SALTED HASH of the
--   request IP (sha256, never the raw IP). Indexed on (ip_hash, created_at)
--   so the per-window count query is a cheap index scan. Old rows are
--   pruned opportunistically by the rate-limit handler itself; no cron
--   required given expected low signup volume.
--
-- Hand-written migration (same approach as 0001/0002 — drizzle-kit generate
-- is blocked by pre-existing schema drift).

CREATE TABLE `waitlist` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `source` text,
  `utm_source` text,
  `utm_medium` text,
  `utm_campaign` text,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `waitlist_email_unique` ON `waitlist` (`email`);
--> statement-breakpoint
CREATE TABLE `waitlist_attempts` (
  `id` text PRIMARY KEY NOT NULL,
  `ip_hash` text NOT NULL,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `waitlist_attempts_ip_created_idx` ON `waitlist_attempts` (`ip_hash`, `created_at`);
