'use client';

import { useMemo, useState } from 'react';
import { ContributionRow } from '@/components/contribution-row';
import { ContributionEditDialog } from '@/components/contribution-edit-dialog';
import { ContributionsPagination } from '@/components/contributions-pagination';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@open-embed-ui/ui/components/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@open-embed-ui/ui/components/select';
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
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        num="02"
        eyebrow="contributions"
        title="Merged pull requests"
        lead="Your merged PRs from public repositories. Add a description and blog link to each contribution."
        actions={
          <>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="border-border bg-background h-[30px] w-36 rounded-md border font-mono text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="border-border bg-background text-foreground hover:border-foreground/40 hover:bg-muted/40 inline-flex h-[30px] items-center gap-2 rounded-md border px-3 font-mono text-[12px] transition-colors disabled:opacity-60"
            >
              {syncing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" strokeWidth={1.75} />
              )}
              {syncing ? 'Syncing…' : 'Sync'}
            </button>
          </>
        }
      />

      {error && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive mb-4 rounded-md border p-3 font-mono text-[12px]">
          <span className="font-semibold">// error: </span>
          {error}
        </div>
      )}

      <div className="space-y-2">
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
    <div className="border-border bg-muted/20 flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <GitPullRequest className="text-muted-foreground/50 size-10" strokeWidth={1.5} />
      <div className="marketing-section-eyebrow text-muted-foreground mt-5 inline-block font-mono text-[11px] tracking-[0.08em] uppercase">
        empty state
      </div>
      <h3 className="mt-1 font-sans text-[18px] font-semibold tracking-[-0.01em]">
        No merged PRs yet
      </h3>
      <p className="text-muted-foreground mt-1.5 max-w-[360px] text-[14px]">
        Sync your GitHub contributions to get started. Merged PRs from public repos will appear
        here.
      </p>
      <button
        type="button"
        onClick={onSync}
        disabled={syncing}
        className="border-foreground bg-foreground text-background hover:bg-foreground/90 mt-5 inline-flex h-[34px] items-center gap-2 rounded-md border px-4 font-mono text-[12px] font-medium transition-colors disabled:opacity-60"
      >
        {syncing ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <RefreshCw className="size-3.5" strokeWidth={1.75} />
        )}
        {syncing ? 'Syncing…' : 'Sync now'}
      </button>
    </div>
  );
}
