import Link from 'next/link';
import { Button } from '@open-embed-ui/ui/components/button';

export function LandingNav() {
  return (
    <header className="bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span aria-hidden="true" className="text-lg">◐</span>
          <span>Open Embed UI</span>
        </Link>
        <nav className="flex items-center gap-2">
          <a
            href="https://github.com/aggmoulik/github-embed-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground hidden text-sm sm:inline"
          >
            GitHub
          </a>
          <Button asChild size="sm" variant="ghost">
            <Link href="/login">Sign in</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
