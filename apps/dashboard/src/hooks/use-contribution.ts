'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchContribution, ApiError } from '@/lib/api-client';
import type { Contribution } from '@/types';

interface UseContributionReturn {
  data: Contribution | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useContribution(id: string): UseContributionReturn {
  const [data, setData] = useState<Contribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);

    fetchContribution(id)
      .then((res) => setData(res))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Failed to fetch contribution');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
