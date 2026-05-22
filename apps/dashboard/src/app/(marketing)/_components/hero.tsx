import Link from 'next/link';
import { CodeCard } from './code-card';
import { InlineWaitlist } from './inline-waitlist';
import { WaitlistTrigger } from './waitlist-trigger';

interface HeroProps {
  isAuthenticated?: boolean;
}

export function Hero({ isAuthenticated = false }: HeroProps) {
  return (
    <section
      className="relative overflow-hidden pt-14 pb-12 sm:pt-22 sm:pb-16 lg:pt-24 lg:pb-20"
      id="top"
    >
      <div className="marketing-grid-bg" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-7">
        <div className="grid items-start gap-10 sm:gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center">
          <div className="min-w-0">
            <span className="border-border bg-background text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] tracking-wide">
              <span
                className="bg-brand size-1.5 rounded-full"
                style={{
                  boxShadow: '0 0 0 3px color-mix(in oklab, var(--brand) 18%, transparent)',
                }}
              />
              <span>private beta</span>
              <span className="text-muted-foreground/60">·</span>
              <span>invite-only</span>
            </span>

            <h1 className="mt-4 text-[36px] leading-[1.05] font-semibold tracking-[-0.035em] text-balance sm:text-[56px] sm:leading-[1.02] lg:text-[64px]">
              Show off your <span className="sm:hidden">open-source PRs </span>
              <span className="hidden sm:inline">
                <br />
                open-source PRs{' '}
              </span>
              <span className="text-foreground/90 font-serif text-[1.04em] font-normal italic">
                anywhere
              </span>
            </h1>

            <p className="text-muted-foreground mt-5 max-w-[540px] text-[17px] leading-[1.55]">
              One{' '}
              <code className="border-border bg-muted text-foreground rounded border px-1.5 py-0.5 font-mono text-[13px]">
                &lt;script&gt;
              </code>{' '}
              tag. Seven layouts. Fully themeable. Zero iframes, zero API keys, zero maintenance.
              Drop it on your blog, portfolio, or README and get a live widget of your merged
              contributions — styled to match your brand.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="border-foreground bg-foreground text-background hover:bg-foreground/90 inline-flex h-[38px] items-center justify-center gap-2 rounded-md border px-4 font-mono text-[13px] font-medium whitespace-nowrap transition-colors"
                >
                  Open dashboard →
                </Link>
              ) : (
                <WaitlistTrigger className="border-foreground bg-foreground text-background hover:bg-foreground/90 inline-flex h-[38px] items-center justify-center gap-2 rounded-md border px-4 font-mono text-[13px] font-medium whitespace-nowrap transition-colors">
                  Join the waitlist →
                </WaitlistTrigger>
              )}
              <a
                href="#demo"
                className="border-border bg-background text-foreground hover:border-foreground/40 hover:bg-muted/40 inline-flex h-[38px] items-center justify-center gap-2 rounded-md border px-4 font-mono text-[13px] font-medium whitespace-nowrap transition-colors"
              >
                See it live ↓
              </a>
              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground font-mono text-[12px] underline-offset-4 transition-colors hover:underline"
                >
                  or sign in
                </Link>
              )}
            </div>

            <div className="border-border text-muted-foreground mt-9 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-dashed pt-5 font-mono text-[11px]">
              <span>
                <span className="text-foreground font-semibold">19 KB</span> gzipped
              </span>
              <span>·</span>
              <span>Shadow-DOM isolated</span>
              <span>·</span>
              <span>
                built by{' '}
                <a
                  href="https://github.com/aggmoulik"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-2"
                >
                  @aggmoulik
                </a>
              </span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[520px] min-w-0 lg:mx-0 lg:w-full lg:max-w-none lg:justify-self-end">
            <CodeCard />
            {isAuthenticated ? (
              <div className="border-border bg-background mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border p-4 sm:flex-nowrap sm:gap-4">
                <div className="min-w-0">
                  <p className="text-muted-foreground font-mono text-[12px]">
                    <span className="text-brand">●</span> Signed in
                  </p>
                  <p className="text-foreground mt-0.5 text-[14px] font-medium">
                    Pick up where you left off.
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="bg-foreground text-background inline-flex h-10 shrink-0 items-center justify-center rounded-md px-4 font-mono text-[13px] font-medium transition-opacity hover:opacity-90"
                >
                  Open dashboard →
                </Link>
              </div>
            ) : (
              <>
                <InlineWaitlist className="mt-4" inputId="waitlist-email" />
                <p className="text-muted-foreground/70 mt-2.5 font-mono text-[11px]">
                  No spam. One email when invites open. Unsubscribe anytime.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
