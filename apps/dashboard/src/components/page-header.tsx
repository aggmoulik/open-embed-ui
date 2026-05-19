import { ReactNode } from 'react';

interface PageHeaderProps {
  /** Two-digit section number rendered before the eyebrow label (e.g. "02"). */
  num?: string;
  /** Lowercase eyebrow tag (e.g. "contributions"). Rendered with marketing-section-eyebrow. */
  eyebrow?: string;
  /** Main page heading. */
  title: string;
  /** Optional supporting paragraph rendered below the title. */
  lead?: ReactNode;
  /** Slot rendered to the right of the title row (e.g. a sync/create button). */
  actions?: ReactNode;
}

/**
 * Shared page-header pattern used across every dashboard surface so the
 * design language doesn't drift. Mirrors the landing's section-eyebrow +
 * 32/38px title + 15-16px muted lead.
 */
export function PageHeader({ num, eyebrow, title, lead, actions }: PageHeaderProps) {
  return (
    <header className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {(num || eyebrow) && (
          <div className="marketing-section-eyebrow text-muted-foreground mb-3 inline-block font-mono text-[11px] tracking-[0.08em] uppercase">
            {num ? `${num} · ` : ''}
            {eyebrow}
          </div>
        )}
        <h1 className="font-sans text-[32px] leading-[1.1] font-semibold tracking-[-0.025em] sm:text-[38px]">
          {title}
        </h1>
        {lead && (
          <p className="text-muted-foreground mt-2 max-w-[620px] text-[15px]">{lead}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
    </header>
  );
}
