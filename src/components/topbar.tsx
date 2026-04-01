'use client';

import { authClient } from '@/lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push('/login');
  }

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
