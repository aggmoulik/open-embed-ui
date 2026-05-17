'use client';

import { Button } from '@open-embed-ui/ui/components/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ContributionsPaginationProps {
  page: number; // 0-indexed
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

/**
 * Hand-rolled pagination bar. Kept simple on purpose: this feature expects
 * low hundreds of rows per user, so we don't need page-number ellipsis
 * handling or a jump-to-page affordance. If that changes later, swap in
 * shadcn's Pagination primitive.
 */
export function ContributionsPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: ContributionsPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const from = total === 0 ? 0 : currentPage * pageSize + 1;
  const to = Math.min(total, (currentPage + 1) * pageSize);

  if (total <= pageSize) {
    return (
      <div className="text-muted-foreground flex justify-end py-2 text-xs">
        {total === 0 ? '0 contributions' : `${total} contribution${total === 1 ? '' : 's'}`}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 text-xs">
      <span className="text-muted-foreground">
        Showing {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="size-3" />
          Prev
        </Button>
        <span className="text-muted-foreground px-2">
          Page {currentPage + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2"
          disabled={currentPage >= pageCount - 1}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
          <ChevronRight className="size-3" />
        </Button>
      </div>
    </div>
  );
}
