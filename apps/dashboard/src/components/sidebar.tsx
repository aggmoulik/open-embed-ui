'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@open-embed-ui/ui/lib/utils';
import { LayoutDashboard, GitPullRequest, Box, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

const VERSION_LABEL = 'open beta';

const baseNavItems = [
  { href: '/dashboard', label: 'overview', icon: LayoutDashboard },
  { href: '/dashboard/contributions', label: 'contributions', icon: GitPullRequest },
  { href: '/dashboard/widgets', label: 'widgets', icon: Box },
  { href: '/dashboard/settings', label: 'settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = baseNavItems;

  return (
    <>
      <button
        type="button"
        className="border-border bg-background text-foreground fixed top-3 left-3 z-50 inline-flex size-9 items-center justify-center rounded-md border md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? (
          <X className="size-5" strokeWidth={1.75} />
        ) : (
          <Menu className="size-5" strokeWidth={1.75} />
        )}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'border-border bg-sidebar fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r transition-transform md:static md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="border-border flex h-14 items-center border-b px-4">
          <Link
            href="/dashboard"
            className="text-sidebar-foreground flex items-center gap-2.5 font-mono text-[13px] font-semibold tracking-[-0.01em]"
          >
            <span
              aria-hidden="true"
              className="bg-sidebar-foreground text-sidebar grid size-[22px] place-items-center rounded-[5px] font-mono text-[12px] font-bold"
            >
              ⌥
            </span>
            <span>openembed/ui</span>
          </Link>
        </div>

        <div className="border-border border-b border-dashed px-4 py-3">
          <span className="text-muted-foreground font-mono text-[10px] tracking-[0.08em] uppercase">
            {'// navigation'}
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 font-mono text-[13px] transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                )}
              >
                <item.icon className="size-4 shrink-0" strokeWidth={1.75} />
                <span>{item.label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="bg-brand ml-auto size-1.5 rounded-full"
                    style={{
                      boxShadow: '0 0 0 2px color-mix(in oklab, var(--brand) 18%, transparent)',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-border text-muted-foreground/70 border-t px-4 py-3 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span>{VERSION_LABEL}</span>
            <a
              href="https://github.com/aggmoulik/github-embed-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              github →
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
