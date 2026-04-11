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
export function useContributions(filters?: ContributionFilters): UseContributionsReturn {
  const [data, setData] = useState<Contribution[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize the filter object so the effect dep is stable across renders
  // (object identity changes every render; the string only changes when a
  // filter value actually changes).
  const filterKey = JSON.stringify(filters ?? {});

  // Track the active request so we can abort on filter change. We don't
  // depend on fetch's AbortSignal here (the api-client doesn't forward one),
  // so instead we tag each request with a monotonically-increasing id and
  // drop responses that don't match the latest.
  const requestIdRef = useRef(0);

  const runFetch = useCallback(() => {
    const myRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    fetchContributions(filters)
      .then((res) => {
        if (requestIdRef.current !== myRequestId) return; // superseded
        setData(res.data);
        setTotal(res.pagination.total);
      })
      .catch((err) => {
        if (requestIdRef.current !== myRequestId) return; // superseded
        setError(err instanceof ApiError ? err.message : 'Failed to fetch contributions');
      })
      .finally(() => {
        if (requestIdRef.current !== myRequestId) return;
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  useEffect(() => {
    runFetch();
  }, [runFetch]);

  const patchLocal = useCallback((id: string, partial: Partial<Contribution>) => {
    setData((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)));
  }, []);

  return { data, total, loading, error, refetch: runFetch, patchLocal };
}
