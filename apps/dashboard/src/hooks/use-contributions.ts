'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchContributions, type ContributionFilters, ApiError } from '@/lib/api-client';
import type { Contribution } from '@/types';

interface UseContributionsReturn {
  data: Contribution[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  /**
   * Replace a single contribution in the cached list by id. Used after an
   * optimistic update so the edited row reflects new values without a full
   * refetch.
   */
  patchLocal: (id: string, partial: Partial<Contribution>) => void;
}

/**
 * Fetches a paginated page of contributions and re-fetches whenever the
 * filter arguments change. Previous versions of this hook used a ref guard
 * that prevented re-fetches after mount — fixed in feature 11.
 *
 * Uses an AbortController per request so a stale response from an earlier
 * filter value can't clobber a newer one.
 */
/**
 * Pass `null` as filters to skip fetching entirely (the hook returns empty
 * data and loading=false). Useful when the caller already has contributions
 * from another source and doesn't need a server round-trip.
 */
export function useContributions(filters?: ContributionFilters | null): UseContributionsReturn {
  const skip = filters === null;
  const [data, setData] = useState<Contribution[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);

  const filterKey = skip ? '__skip__' : JSON.stringify(filters ?? {});

  const requestIdRef = useRef(0);

  const runFetch = useCallback(() => {
    if (skip) {
      setLoading(false);
      return;
    }
    const myRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    fetchContributions(filters ?? undefined)
      .then((res) => {
        if (requestIdRef.current !== myRequestId) return;
        setData(res.data);
        setTotal(res.pagination.total);
      })
      .catch((err) => {
        if (requestIdRef.current !== myRequestId) return;
        setError(err instanceof ApiError ? err.message : 'Failed to fetch contributions');
      })
      .finally(() => {
        if (requestIdRef.current !== myRequestId) return;
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, skip]);

  useEffect(() => {
    runFetch();
  }, [runFetch]);

  const patchLocal = useCallback((id: string, partial: Partial<Contribution>) => {
    setData((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)));
  }, []);

  return { data, total, loading, error, refetch: runFetch, patchLocal };
}
