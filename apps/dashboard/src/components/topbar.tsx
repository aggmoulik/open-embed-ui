'use client';

import { authClient } from '@/lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from '@github-embed-ui/ui/components/avatar';
import { Button } from '@github-embed-ui/ui/components/button';
import { LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

export function Topbar() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  async function handleLogout() {
    await authClient.signOut();
    router.push('/login');
  }

  function cycleTheme() {
    const order = ['system', 'light', 'dark'] as const;
    const current = order.indexOf(theme as (typeof order)[number]);
    const next = order[(current + 1) % order.length];
    setTheme(next);
  }

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <header className="flex h-14 items-center justify-end gap-3 border-b border-border bg-background px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={cycleTheme}
        aria-label={`Theme: ${theme}`}
      >
        <ThemeIcon className="size-4" />
      </Button>

      {user && (
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium sm:inline">
            {user.name}
          </span>
          <Avatar className="size-8">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      )}
    </header>
  );
}
