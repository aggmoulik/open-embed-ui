/**
 * Validators for the contribution PATCH endpoint (features 11 + 13).
 *
 * Hand-rolled to match the existing dashboard convention (see
 * `apps/dashboard/src/app/api/profile/route.ts`) and avoid pulling in zod
 * for a single endpoint. Edge-runtime safe.
 */

import { VALID_LABELS } from '@open-embed-ui/types';

export const TITLE_OVERRIDE_MAX = 200;
export const DESCRIPTION_MAX = 500;
export const BLOG_URL_MAX = 2048;

export interface UpdateContributionInput {
  titleOverride?: string | null;
  description?: string | null;
  blogUrl?: string | null;
  blogOpenInNewTab?: boolean;
  labels?: string[] | null;
}

export type ValidationResult =
  | { ok: true; data: UpdateContributionInput }
  | { ok: false; errors: Record<string, string> };

/**
 * Validates a request body for `PATCH /api/contributions/[id]`.
 *
 * - All fields are optional. Absent fields are not touched on update.
 * - `null` is allowed for `description` / `blogUrl` — the user can clear
 *   a value.
 * - `description` is plain text with a hard char cap.
 * - `blogUrl` must be a valid http(s) URL. `javascript:`, `data:`,
 *   `vbscript:`, and missing-scheme strings are rejected.
 * - `blogOpenInNewTab` is a boolean; controls whether the rendered link
 *   uses `target="_blank"`.
 */
export function validateUpdateContribution(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, errors: { _: 'Body must be a JSON object' } };
  }

  const input = body as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const data: UpdateContributionInput = {};

  if ('titleOverride' in input) {
    const value = input.titleOverride;
    if (value === null || value === '') {
      data.titleOverride = null;
    } else if (typeof value !== 'string') {
      errors.titleOverride = 'titleOverride must be a string or null';
    } else if (value.length > TITLE_OVERRIDE_MAX) {
      errors.titleOverride = `titleOverride must be ${TITLE_OVERRIDE_MAX} characters or fewer`;
    } else {
      data.titleOverride = value;
    }
  }

  if ('description' in input) {
    const value = input.description;
    if (value === null) {
      data.description = null;
    } else if (typeof value !== 'string') {
      errors.description = 'description must be a string or null';
    } else if (value.length > DESCRIPTION_MAX) {
      errors.description = `description must be ${DESCRIPTION_MAX} characters or fewer`;
    } else {
      data.description = value;
    }
  }

  if ('blogUrl' in input) {
    const value = input.blogUrl;
    if (value === null || value === '') {
      data.blogUrl = null;
    } else if (typeof value !== 'string') {
      errors.blogUrl = 'blogUrl must be a string or null';
    } else if (value.length > BLOG_URL_MAX) {
      errors.blogUrl = `blogUrl must be ${BLOG_URL_MAX} characters or fewer`;
    } else if (!isSafeHttpUrl(value)) {
      errors.blogUrl = 'blogUrl must be a valid http or https URL';
    } else {
      data.blogUrl = value;
    }
  }

  if ('labels' in input) {
    const value = input.labels;
    if (value === null) {
      data.labels = null;
    } else if (!Array.isArray(value)) {
      errors.labels = 'labels must be an array or null';
    } else if (value.length > 2) {
      errors.labels = 'maximum 2 labels allowed';
    } else {
      const invalid = value.filter((v: unknown) => typeof v !== 'string' || !VALID_LABELS.has(v));
      if (invalid.length > 0) {
        errors.labels = `invalid label(s): ${invalid.join(', ')}`;
      } else {
        data.labels = value as string[];
      }
    }
  }

  if ('blogOpenInNewTab' in input) {
    const value = input.blogOpenInNewTab;
    if (typeof value !== 'boolean') {
      errors.blogOpenInNewTab = 'blogOpenInNewTab must be a boolean';
    } else {
      data.blogOpenInNewTab = value;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data };
}

/**
 * Returns true iff `value` parses as a URL with an http or https scheme.
 * Rejects `javascript:`, `data:`, `vbscript:`, `file:`, and any other
 * scheme that could be used for XSS or local-resource access.
 *
 * Uses the global `URL` constructor (Web API), which is available in
 * Node, Cloudflare Workers, Deno, and browsers.
 */
export function isSafeHttpUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

/**
 * Returns the URL if it parses as http(s); otherwise '#'. Use for
 * `<a href={safeHref(...)}>` defense-in-depth at render time, even
 * when the API write boundary already rejects unsafe schemes.
 */
export function safeHref(value: string | undefined | null): string {
  if (!value) return '#';
  return isSafeHttpUrl(value) ? value : '#';
}

/**
 * Returns the URL if it parses as http(s); otherwise empty string.
 * Use for `<img src={safeImgSrc(...)}>` so the browser does not render
 * a broken-image icon for a `#` src.
 */
export function safeImgSrc(value: string | undefined | null): string {
  if (!value) return '';
  return isSafeHttpUrl(value) ? value : '';
}
