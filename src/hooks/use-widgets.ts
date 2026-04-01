'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchWidgets, ApiError } from '@/lib/api-client';
import type { Widget } from '@/types';

export function useWidgets() {
  const [data, setData] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);

    fetchWidgets()
      .then((res) => setData(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to fetch widgets'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
