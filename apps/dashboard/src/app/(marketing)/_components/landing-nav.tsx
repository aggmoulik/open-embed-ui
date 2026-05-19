import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { WaitlistTrigger } from './waitlist-trigger';

const VERSION_LABEL = 'private beta';

interface LandingNavProps {
  isAuthenticated?: boolean;
}

export function LandingNav({ isAuthenticated = false }: LandingNavProps) {
  return (
    <header className="border-border bg-background/75 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between px-7">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-mono text-[13px] font-semibold tracking-[-0.01em]"
        >
          <span
            aria-hidden="true"
            className="bg-foreground text-background grid size-[22px] place-items-center rounded-[5px] font-mono text-[12px] font-bold"
          >
            ⌥
          </span>
          <span>openembed/ui</span>
          <span className="text-muted-foreground/80 font-normal">{VERSION_LABEL}</span>
        </Link>

        <nav className="text-muted-foreground flex items-center gap-5 font-mono text-[13px]">
          <a href="#demo" className="hover:text-foreground hidden transition-colors sm:inline">
            demo
          </a>
          <a href="#layouts" className="hover:text-foreground hidden transition-colors sm:inline">
            layouts
          </a>
          <a href="#features" className="hover:text-foreground hidden transition-colors sm:inline">
            features
          </a>
          {!isAuthenticated && (
            <Link
              href="/login"
              className="hover:text-foreground hidden transition-colors md:inline"
            >
              sign in
            </Link>
          )}

          <ThemeToggle />

          <a
            href="https://github.com/aggmoulik"
            target="_blank"
            rel="noopener noreferrer"
            className="border-border bg-background hover:border-foreground/40 hidden h-[30px] items-center gap-2 rounded-md border px-3 text-[12px] transition-colors sm:inline-flex"
            title="Built by @aggmoulik"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.18c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.76.11 3.05.74.8 1.19 1.82 1.19 3.08 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
            </svg>
            @aggmoulik
          </a>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="border-foreground bg-foreground text-background hover:bg-foreground/90 inline-flex h-[30px] items-center gap-2 rounded-md border px-3 text-[12px] font-medium transition-colors"
            >
              Open dashboard →
            </Link>
          ) : (
            <WaitlistTrigger className="border-foreground bg-foreground text-background hover:bg-foreground/90 inline-flex h-[30px] items-center gap-2 rounded-md border px-3 text-[12px] font-medium transition-colors">
              Join waitlist →
            </WaitlistTrigger>
          )}
        </nav>
      </div>
    </header>
  );
}
