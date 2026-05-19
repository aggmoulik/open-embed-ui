'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

// Classify the raw error query-param into one of our known buckets.
// better-auth's onAPIError.errorURL redirect can either:
//   (a) pass our APIError `code` (e.g. "WAITLIST_REQUIRED") in `?error=` — short, snake-case
//   (b) pass the full APIError `message` in `?error=` — long, sentence-cased
// We detect (a) by exact match against known codes, and fall back to keyword
// sniffing on the message for (b) so we don't display raw URL-encoded text.
type ErrorKind = 'waitlist' | 'cancelled' | 'generic';

function classifyError(raw: string | null | undefined): ErrorKind | null {
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (upper === 'WAITLIST_REQUIRED' || upper === 'FORBIDDEN') return 'waitlist';
  if (raw === 'access_denied' || /cancel/i.test(raw)) return 'cancelled';
  if (/waitlist/i.test(raw)) return 'waitlist';
  return 'generic';
}

const ERROR_MESSAGES: Record<ErrorKind, string> = {
  waitlist:
    "You're not on the waitlist yet, or your account hasn't been approved. Join the waitlist from the home page — we'll send an invite when capacity opens.",
  cancelled: 'GitHub sign-in was cancelled. No account was created.',
  generic: "Sign-in didn't go through. Please try again.",
};

export default function LoginPage() {
  const search = useSearchParams();
  const rawError = search?.get('error') ?? search?.get('error_description') ?? null;
  const kind = classifyError(rawError);
  const errorMessage = kind ? ERROR_MESSAGES[kind] : null;

  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Surface the error as a toast on first paint so it's noticed even if the
  // user scrolls past the inline banner.
  useEffect(() => {
    if (errorMessage) toast.error(errorMessage);
  }, [errorMessage]);

  function handleGitHubLogin() {
    authClient.signIn.social({
      provider: 'github',
      callbackURL: '/dashboard',
    });
  }

  async function handleMagicLink() {
    if (!email) return;
    setLoading(true);
    try {
      await authClient.signIn.magicLink({
        email,
        callbackURL: '/dashboard',
      });
      setMagicLinkSent(true);
      toast.success('Magic link sent — check your terminal');
    } catch {
      toast.error('Failed to send magic link');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="marketing-grid-bg" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-[440px]">
        <div className="mb-8 flex items-center justify-center gap-2.5 font-mono text-[13px] font-semibold tracking-[-0.01em]">
          <span
            aria-hidden="true"
            className="bg-foreground text-background grid size-[22px] place-items-center rounded-[5px] font-mono text-[12px] font-bold"
          >
            ⌥
          </span>
          <span>openembed/ui</span>
          <span className="text-muted-foreground/80 font-normal">private beta</span>
        </div>

        <div className="border-border bg-background rounded-xl border p-7 shadow-[0_1px_0_rgba(0,0,0,.02),0_4px_16px_rgba(0,0,0,.05)]">
          <div className="mb-6">
            <div className="marketing-section-eyebrow text-muted-foreground mb-2 inline-block font-mono text-[11px] tracking-[0.08em] uppercase">
              sign in
            </div>
            <h1 className="font-sans text-[24px] leading-[1.15] font-semibold tracking-[-0.02em]">
              Showcase your open-source contributions.
            </h1>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="border-destructive/40 bg-destructive/5 text-destructive mb-4 rounded-md border p-3 font-mono text-[12px] leading-[1.55]"
            >
              <span className="font-semibold">
                // {kind === 'waitlist' ? 'waitlist required' : 'sign-in failed'}
              </span>
              <div className="text-foreground/90 mt-1.5 font-sans text-[13px]">{errorMessage}</div>
              {kind === 'waitlist' && (
                <a
                  href="/#waitlist-email"
                  className="text-foreground mt-2 inline-block font-mono text-[12px] underline underline-offset-2 hover:opacity-80"
                >
                  Join the waitlist →
                </a>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleGitHubLogin}
            className="border-foreground bg-foreground text-background inline-flex w-full items-center justify-center gap-2.5 rounded-md border px-4 py-3 font-mono text-[13px] font-medium transition-opacity hover:opacity-90"
          >
            <GitHubIcon />
            Sign in with GitHub
          </button>

          {process.env.NODE_ENV === 'development' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <span className="border-border w-full border-t border-dashed" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background text-muted-foreground/70 px-2 font-mono text-[10px] tracking-[0.08em] uppercase">
                    // dev only
                  </span>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleMagicLink();
                }}
                className="border-border bg-background focus-within:border-foreground focus-within:ring-brand/30 flex max-w-full overflow-hidden rounded-md border transition-shadow focus-within:ring-2"
              >
                <input
                  type="email"
                  placeholder="dev@localhost.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  aria-label="Dev email address"
                  className="text-foreground placeholder:text-muted-foreground/60 h-10 flex-1 border-0 bg-transparent px-3.5 font-mono text-[13px] focus:outline-none disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="bg-foreground text-background inline-flex h-10 items-center justify-center px-4 font-mono text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? 'Sending…' : 'Magic link'}
                </button>
              </form>

              {magicLinkSent && (
                <p className="text-muted-foreground mt-3 font-mono text-[11px]">
                  <span className="text-brand">●</span> Magic link logged to dev terminal.
                </p>
              )}
            </>
          )}
        </div>

        <p className="text-muted-foreground/70 mt-5 text-center font-mono text-[11px]">
          By signing in you agree to our{' '}
          <a href="/terms" className="underline-offset-2 hover:underline">
            terms
          </a>{' '}
          and{' '}
          <a href="/privacy" className="underline-offset-2 hover:underline">
            privacy policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
