import Link from 'next/link';
import { GitPullRequest, Box, Settings } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

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
      <PageHeader
        num="01"
        eyebrow="overview"
        title="Welcome back."
        lead="Use the sidebar to navigate, or jump straight to one of the workflows below."
      />

      <div className="border-border bg-background grid grid-cols-1 overflow-hidden rounded-xl border sm:grid-cols-3">
        {QUICK_LINKS.map((q, i) => {
          const onRight = i === QUICK_LINKS.length - 1;
          return (
            <Link
              key={q.href}
              href={q.href}
              className={`group hover:bg-muted/40 flex flex-col gap-3 p-7 transition-colors ${
                onRight ? '' : 'border-border sm:border-r'
              }`}
            >
              <q.icon className="text-muted-foreground size-5" strokeWidth={1.75} />
              <h3 className="text-[16px] font-semibold tracking-[-0.01em]">{q.title}</h3>
              <p className="text-muted-foreground m-0 flex-1 text-[14px] leading-[1.55]">
                {q.body}
              </p>
              <span className="text-brand group-hover:text-brand/80 mt-2 font-mono text-[12px] transition-colors">
                {q.cta}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
