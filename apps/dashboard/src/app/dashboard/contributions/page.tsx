'use client';

import { useMemo, useState } from 'react';
import { ContributionRow } from '@/components/contribution-row';
import { ContributionEditDialog } from '@/components/contribution-edit-dialog';
import { ContributionsPagination } from '@/components/contributions-pagination';
import { Button } from '@github-embed-ui/ui/components/button';
import { Skeleton } from '@github-embed-ui/ui/components/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@github-embed-ui/ui/components/select';
import { GitPullRequest, RefreshCw, Loader2 } from 'lucide-react';
import { useContributions, useSyncContributions } from '@/hooks';
import { toast } from 'sonner';
import type { Contribution } from '@/types';

type SortOrder = 'newest' | 'oldest';

const PAGE_SIZE = 25;

export default function ContributionsPage() {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortOrder>('newest');
  const [editing, setEditing] = useState<Contribution | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filters = useMemo(
    () => ({
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      sort,
    }),
    [page, sort],
  );

  const {
    data: contributions,
    total,
    loading,
    error,
    refetch,
    patchLocal,
  } = useContributions(filters);
  const { sync, loading: syncing } = useSyncContributions();

  async function handleSync() {
    try {
      await sync();
      setPage(0);
      refetch();
      toast.success('Contributions synced');
    } catch {
      toast.error('Failed to sync contributions');
    }
  }

  function handleSortChange(value: string) {
    setSort(value === 'oldest' ? 'oldest' : 'newest');
    setPage(0);
  }

  function handleEdit(contribution: Contribution) {
    setEditing(contribution);
    setDialogOpen(true);
  }

  function handleSaved(updated: Contribution) {
    patchLocal(updated.id, updated);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Merged Pull Requests</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your merged PRs from public repositories. Add a description and blog link to each
            contribution.
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

      <div className="mt-4 flex items-center justify-end gap-2">
        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-lg border p-3 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 space-y-2">
        {loading ? (
          <LoadingSkeleton />
        ) : contributions.length > 0 ? (
          contributions.map((c) => (
            <ContributionRow key={c.id} contribution={c} onEdit={handleEdit} />
          ))
        ) : (
          <EmptyState onSync={handleSync} syncing={syncing} />
        )}
      </div>

      {!loading && contributions.length > 0 && (
        <ContributionsPagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
        />
      )}

      <ContributionEditDialog
        contribution={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-3">
          <div className="flex items-start gap-3">
            <Skeleton className="size-5 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
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
