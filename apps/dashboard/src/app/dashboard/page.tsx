import Link from 'next/link';
import { GitPullRequest, Box, Settings } from 'lucide-react';

const QUICK_LINKS = [
  {
    href: '/dashboard/contributions',
    icon: GitPullRequest,
    title: 'Contributions',
    body: 'Sync your merged PRs from GitHub and edit per-PR titles, descriptions, and labels.',
    cta: 'Open contributions →',
  },
  {
    href: '/dashboard/widgets',
    icon: Box,
    title: 'Widgets',
    body: 'Create, configure, and grab the embed code for any of the 14 layouts.',
    cta: 'Manage widgets →',
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    title: 'Settings',
    body: 'Profile info, GitHub identity, account deactivation, and theme preferences.',
    cta: 'Open settings →',
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-10">
        <div className="marketing-section-eyebrow mb-3 inline-block font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          01 · overview
        </div>
        <h1 className="font-sans text-[32px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[38px]">
          Welcome back.
        </h1>
        <p className="mt-2 max-w-[620px] text-[15px] text-muted-foreground">
          Use the sidebar to navigate, or jump straight to one of the workflows below.
        </p>
      </div>

      <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-background sm:grid-cols-3">
        {QUICK_LINKS.map((q, i) => {
          const onRight = i === QUICK_LINKS.length - 1;
          return (
            <Link
              key={q.href}
              href={q.href}
              className={`group flex flex-col gap-3 p-7 transition-colors hover:bg-muted/40 ${
                onRight ? '' : 'sm:border-r border-border'
              }`}
            >
              <q.icon className="size-5 text-muted-foreground" strokeWidth={1.75} />
              <h3 className="text-[16px] font-semibold tracking-[-0.01em]">{q.title}</h3>
              <p className="m-0 flex-1 text-[14px] leading-[1.55] text-muted-foreground">
                {q.body}
              </p>
              <span className="mt-2 font-mono text-[12px] text-brand transition-colors group-hover:text-brand/80">
                {q.cta}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
