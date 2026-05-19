import Link from 'next/link';
import { InlineWaitlist } from './inline-waitlist';

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
    <section className="border-t border-foreground bg-foreground py-24 text-background">
      <div className="mx-auto max-w-[720px] px-7 text-center">
        <div className="marketing-section-eyebrow mb-3 inline-block font-mono text-[11px] uppercase tracking-[0.08em] text-background/60">
          05 · ship it
        </div>
        <h2 className="font-sans text-[32px] font-semibold leading-[1.1] tracking-[-0.025em] text-background sm:text-[38px]">
          Stop screenshotting{' '}
          <span className="line-through decoration-background/40">your PRs</span>.
          <br />
          Embed them.
        </h2>

        {isAuthenticated ? (
          <>
            <p className="mx-auto mb-7 mt-3.5 max-w-[620px] text-[16px] text-background/70">
              You&apos;re signed in. Build a widget, copy the snippet, paste it anywhere.
            </p>
            <div className="flex justify-center">
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand px-5 font-mono text-[13px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Open dashboard →
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mx-auto mb-7 mt-3.5 max-w-[620px] text-[16px] text-background/70">
              Private beta is open. We&apos;re sending 200 invites a week to people on the
              waitlist.
            </p>
            <div className="flex justify-center">
              <InlineWaitlist variant="dark" buttonLabel="Get my invite" />
            </div>
          </>
        )}

        <p className="mt-4.5 font-mono text-[12px] text-background/60">
          A solo project by{' '}
          <a
            href="https://github.com/aggmoulik"
            target="_blank"
            rel="noopener noreferrer"
            className="text-background underline underline-offset-2"
          >
            @aggmoulik
          </a>{' '}
          · closed beta
        </p>
      </div>
    </section>
  );
}
