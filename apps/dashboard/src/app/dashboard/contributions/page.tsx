'use client';

import { useState } from 'react';
import { ContributionCard } from '@/components/contribution-card';
import { Button } from '@github-embed-ui/ui/components/button';
import { Skeleton } from '@github-embed-ui/ui/components/skeleton';
import { GitPullRequest, RefreshCw, Loader2 } from 'lucide-react';
import { useContributions, useSyncContributions } from '@/hooks';
import { toast } from 'sonner';

type SortOrder = 'newest' | 'oldest';

export default function ContributionsPage() {
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const { data: contributions, loading, error, refetch } = useContributions();
  const { sync, loading: syncing, error: syncError } = useSyncContributions();

  const sorted = [...contributions].sort((a, b) => {
    const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return sortOrder === 'newest' ? diff : -diff;
  });

  async function handleSync() {
    await sync();
    refetch();
    if (syncError) {
      toast.error('Failed to sync contributions');
    } else {
      toast.success('Contributions synced');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Merged Pull Requests</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your merged PRs from public repositories.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          {syncing ? 'Syncing...' : 'Sync'}
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortOrder((o) => (o === 'newest' ? 'oldest' : 'newest'))}
        >
          {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
        </Button>
      </div>

      {error && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-lg border p-3 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {loading ? (
          <LoadingSkeleton />
        ) : sorted.length > 0 ? (
          sorted.map((c) => <ContributionCard key={c.id} contribution={c} />)
        ) : (
          <EmptyState onSync={handleSync} syncing={syncing} />
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyState({ onSync, syncing }: { onSync: () => void; syncing: boolean }) {
  return (
    <div className="border-border flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <GitPullRequest className="text-muted-foreground/50 size-10" />
      <h3 className="mt-4 text-lg font-medium">No merged PRs yet</h3>
      <p className="text-muted-foreground mt-1 max-w-xs text-sm">
        Import your GitHub contributions to get started. Merged PRs from public repos will appear
        here.
      </p>
      <Button className="mt-4 gap-1.5" onClick={onSync} disabled={syncing}>
        {syncing ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <RefreshCw className="size-3.5" />
        )}
        {syncing ? 'Syncing...' : 'Sync Now'}
      </Button>
    </div>
  );
}
