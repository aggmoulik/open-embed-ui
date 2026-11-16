import Link from 'next/link';

interface FinalCtaProps {
  isAuthenticated?: boolean;
}

/**
 * Inverse-palette section. Always contrasts the rest of the page:
 *   light theme → near-black background + near-white text
 *   dark  theme → near-white background + near-black text
 * Done via `bg-foreground` + `text-background` which both invert with `--background`/`--foreground`.
 */
export function FinalCta({ isAuthenticated = false }: FinalCtaProps) {
  return (
    <section className="border-foreground bg-foreground text-background border-t py-16 sm:py-24">
      <div className="mx-auto max-w-[720px] px-5 text-center sm:px-7">
        <div className="marketing-section-eyebrow text-background/60 mb-3 inline-block font-mono text-[11px] tracking-[0.08em] uppercase">
          05 · ship it
        </div>
        <h2 className="text-background font-sans text-[32px] leading-[1.1] font-semibold tracking-[-0.025em] sm:text-[38px]">
          Stop screenshotting{' '}
          <span className="decoration-background/40 line-through">your PRs</span>.
          <br />
          Embed them.
        </h2>

        {isAuthenticated ? (
          <>
            <p className="text-background/70 mx-auto mt-3.5 mb-7 max-w-[620px] text-[16px]">
              You&apos;re signed in. Build a widget, copy the snippet, paste it anywhere.
            </p>
            <div className="flex justify-center">
              <Link
                href="/dashboard"
                className="bg-brand inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 font-mono text-[13px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Open dashboard →
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-background/70 mx-auto mt-3.5 mb-7 max-w-[620px] text-[16px]">
              Open beta is live. Sign in with GitHub and build your first widget in minutes.
            </p>
            <div className="flex justify-center">
              <Link
                href="/login"
                className="bg-brand inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 font-mono text-[13px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Sign in with GitHub →
              </Link>
            </div>
          </>
        )}

        <p className="text-background/60 mt-4.5 font-mono text-[12px]">
          A solo project by{' '}
          <a
            href="https://github.com/aggmoulik"
            target="_blank"
            rel="noopener noreferrer"
            className="text-background underline underline-offset-2"
          >
            @aggmoulik
          </a>{' '}
          · open beta
        </p>
      </div>
    </section>
  );
}
