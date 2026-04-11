-- Feature 11: PR metadata + paginated My Contributions
--
-- Adds three user-authored fields to the contributions table:
--   description          — short plain-text brief (≤500 chars in app)
--   blog_url             — optional URL to a blog post about the PR
--   blog_open_in_new_tab — whether to open the blog link in a new tab
--                          (user-controlled via checkbox; default true)
--
-- The github-sync upsert deliberately OMITS these columns from its `set`
-- clause so user data survives every re-sync.
--
-- IMPORTANT: This file is hand-written, NOT generated via `drizzle-kit
-- generate`. The migration journal (meta/_journal.json) has drifted from
-- schema.ts because the team has been using `pnpm db:push` for dev. Running
-- `drizzle-kit generate` here would emit an interactive rename-conflict
-- prompt and a destructive diff. Apply this migration via `pnpm db:push`
-- (the existing dev flow) or by running the SQL directly against Turso in
-- prod. See docs/features/11-pr-metadata-contributions/session-log.md.

ALTER TABLE `contributions` ADD COLUMN `description` text;
--> statement-breakpoint
ALTER TABLE `contributions` ADD COLUMN `blog_url` text;
--> statement-breakpoint
ALTER TABLE `contributions` ADD COLUMN `blog_open_in_new_tab` integer DEFAULT true NOT NULL;
