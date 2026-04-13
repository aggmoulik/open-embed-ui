-- Feature 13: Contribution labels
--
-- Adds a JSON text column for up to 2 user-chosen labels per contribution.
-- Values must be from a predefined set (validated in the API layer).
-- Null means "auto-detect from PR title at render time" (fallback to
-- conventional-commit prefix detection in the widget).
--
-- User-authored: the github-sync upsert deliberately OMITS this column
-- so labels survive every re-sync (same pattern as description/blogUrl).
--
-- Hand-written migration (same approach as 0001_pr_metadata.sql).

ALTER TABLE `contributions` ADD COLUMN `labels` text;
--> statement-breakpoint
ALTER TABLE `contributions` ADD COLUMN `title_override` text;
