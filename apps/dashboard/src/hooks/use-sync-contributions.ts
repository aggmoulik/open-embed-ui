'use client';

import { useCallback, useState } from 'react';
import { syncContributions, ApiError } from '@/lib/api-client';

interface UseSyncContributionsReturn {
  sync: () => Promise<void>;
  loading: boolean;
  error: string | null;
  contributionsSynced: number | null;
  reposScanned: number | null;
}

export function useSyncContributions(): UseSyncContributionsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contributionsSynced, setContributionsSynced] = useState<number | null>(null);
  const [reposScanned, setReposScanned] = useState<number | null>(null);

  const sync = useCallback(async () => {
    setLoading(true);
    setError(null);
    setContributionsSynced(null);
    setReposScanned(null);

    try {
      const res = await syncContributions();
      setContributionsSynced(res.contributionsSynced);
      setReposScanned(res.reposScanned);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sync failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { sync, loading, error, contributionsSynced, reposScanned };
}
