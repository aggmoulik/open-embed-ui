'use client';

import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from '@open-embed-ui/ui/components/avatar';
import { Button } from '@open-embed-ui/ui/components/button';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useProfile } from '@/hooks';

export function Topbar() {
  const { data: session } = authClient.useSession();
  const { data: profile } = useProfile();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  async function handleLogout() {
    await authClient.signOut();
    router.push('/login');
  }

  const isDark = mounted && resolvedTheme === 'dark';

  function toggleTheme() {
    setTheme(isDark ? 'light' : 'dark');
  }

  const ThemeIcon = isDark ? Sun : Moon;

  // Use profile data (live from DB) for name/image, fall back to session
  const user = profile ?? session?.user;
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const themeLabel = !mounted
    ? 'Toggle theme'
    : isDark
      ? 'Switch to light theme'
      : 'Switch to dark theme';

  return (
    <header className="border-border bg-background flex h-14 items-center justify-end gap-3 border-b px-4 md:px-6">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={themeLabel}
        title={themeLabel}
        className="border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground inline-flex size-[30px] items-center justify-center rounded-md border transition-colors"
      >
        <ThemeIcon className="size-3.5" strokeWidth={1.75} />
      </button>

      {user && (
        <div className="flex items-center gap-2.5">
          <span className="text-muted-foreground hidden font-mono text-[12px] sm:inline">
            {user.name}
          </span>
          <Avatar className="size-[30px]">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="font-mono text-[11px]">{initials}</AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="icon-sm" onClick={handleLogout} aria-label="Log out">
            <LogOut className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      )}
    </header>
  );
}
