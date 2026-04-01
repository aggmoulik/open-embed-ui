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
}

export function useContributions(filters?: ContributionFilters): UseContributionsReturn {
  const [data, setData] = useState<Contribution[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const filterKey = JSON.stringify(filters ?? {});

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);

    fetchContributions(filters)
      .then((res) => {
        setData(res.data);
        setTotal(res.pagination.total);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Failed to fetch contributions');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    refetch();
    return () => {
      fetchedRef.current = false;
    };
  }, [refetch]);

  return { data, total, loading, error, refetch };
}
