'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchWidget,
  updateWidget as apiUpdateWidget,
  deleteWidget as apiDeleteWidget,
  ApiError,
} from '@/lib/api-client';
import type { Widget, WidgetConfig } from '@/types';

export function useWidget(id: string | null) {
  const [data, setData] = useState<Widget | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const refetch = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetchWidget(id)
      .then((res) => setData(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to fetch widget'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    refetch();
    return () => {
      fetchedRef.current = false;
    };
  }, [id, refetch]);

  const update = useCallback(
    async (
      updates: Partial<{
        name: string;
        description: string;
        config: WidgetConfig;
        isPublic: boolean;
        allowedOrigins: string[] | null;
      }>,
    ) => {
      if (!id) return;
      const res = await apiUpdateWidget(id, updates);
      setData(res.data);
      return res.data;
    },
    [id],
  );

  const remove = useCallback(async () => {
    if (!id) return;
    await apiDeleteWidget(id);
    setData(null);
  }, [id]);

  return { data, loading, error, refetch, update, remove };
}
