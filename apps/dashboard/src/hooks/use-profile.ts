'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchProfile, updateProfile, ApiError } from '@/lib/api-client';
import type { User } from '@/types';

interface UseProfileReturn {
  data: User | null;
  loading: boolean;
  error: string | null;
  update: (fields: Partial<Pick<User, 'name' | 'image'>>) => Promise<void>;
  refetch: () => void;
}

export function useProfile(): UseProfileReturn {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);

    fetchProfile()
      .then((res) => setData(res.data))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Failed to fetch profile');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const update = useCallback(async (fields: Partial<Pick<User, 'name' | 'image'>>) => {
    setError(null);
    try {
      const res = await updateProfile(fields);
      setData(res.data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update profile';
      setError(message);
      throw err;
    }
  }, []);

  return { data, loading, error, update, refetch };
}
