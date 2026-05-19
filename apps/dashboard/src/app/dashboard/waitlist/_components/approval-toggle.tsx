'use client';

import { useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface ApprovalToggleProps {
  id: string;
  email: string;
  initialApproved: boolean;
}

/**
 * Approve/revoke a waitlist row. Optimistic UI — flips state immediately,
 * rolls back on API failure. Closed-beta gate (`isInvited` in lib/invites.ts)
 * reads `approvedAt IS NOT NULL` so toggling here directly controls who can
 * complete the GitHub OAuth sign-in.
 */
export function ApprovalToggle({ id, email, initialApproved }: ApprovalToggleProps) {
  const [approved, setApproved] = useState(initialApproved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !approved;
    setLoading(true);
    setApproved(next); // optimistic flip
    try {
      const res = await fetch(`/api/admin/waitlist/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(next ? `${email} approved` : `${email} revoked`);
    } catch (err) {
      setApproved(!next); // roll back
      toast.error(`Failed to ${next ? 'approve' : 'revoke'} — ${err instanceof Error ? err.message : 'unknown'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={approved ? `Revoke approval for ${email}` : `Approve ${email}`}
      title={approved ? 'Click to revoke approval' : 'Click to approve'}
      className={
        approved
          ? 'border-brand/40 bg-brand/10 text-brand hover:bg-brand/15 inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] transition-colors disabled:opacity-60'
          : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors disabled:opacity-60'
      }
    >
      {loading ? (
        <Loader2 className="size-3 animate-spin" />
      ) : approved ? (
        <Check className="size-3" strokeWidth={2.5} />
      ) : (
        <X className="size-3 opacity-60" strokeWidth={2} />
      )}
      {approved ? 'approved' : 'pending'}
    </button>
  );
}
