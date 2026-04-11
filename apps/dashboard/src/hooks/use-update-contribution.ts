'use client';

import { useCallback, useState } from 'react';
import { updateContribution, type UpdateContributionPayload, ApiError } from '@/lib/api-client';
import type { Contribution } from '@/types';

interface UseUpdateContributionReturn {
  save: (id: string, data: UpdateContributionPayload) => Promise<Contribution | null>;
  saving: boolean;
  error: string | null;
  /** Field-level errors returned by the server (e.g. `{ blogUrl: '...' }`). */
  fieldErrors: Record<string, string> | null;
}

/**
 * Wraps the PATCH /api/contributions/[id] endpoint. Returns the updated row
 * on success, or null on failure (after setting `error` / `fieldErrors`).
 * The caller is responsible for updating any local cache — use
 * `useContributions().patchLocal(id, updated)` for the typical flow.
 */
export function useUpdateContribution(): UseUpdateContributionReturn {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);

  const save = useCallback(async (id: string, data: UpdateContributionPayload) => {
    setSaving(true);
    setError(null);
    setFieldErrors(null);
    try {
      const updated = await updateContribution(id, data);
      return updated;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        const body = err.body as { error: string; fields?: Record<string, string> };
        if (body.fields) setFieldErrors(body.fields);
      } else {
        setError('Failed to save contribution');
      }
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  return { save, saving, error, fieldErrors };
}
