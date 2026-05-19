'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { isValidEmail } from '@/lib/validation/email';

function readUtm(): { utm_source?: string; utm_medium?: string; utm_campaign?: string } {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const out: { utm_source?: string; utm_medium?: string; utm_campaign?: string } = {};
  const s = params.get('utm_source');
  const m = params.get('utm_medium');
  const c = params.get('utm_campaign');
  if (s) out.utm_source = s;
  if (m) out.utm_medium = m;
  if (c) out.utm_campaign = c;
  return out;
}

interface InlineWaitlistProps {
  /** "light" = white pill on light bg (hero). "dark" = dark pill on inverted bg (final CTA). */
  variant?: 'light' | 'dark';
  className?: string;
  /** CTA button label. */
  buttonLabel?: string;
  /** Set an `id` on the input — used by the nav's WaitlistTrigger to focus it. */
  inputId?: string;
}

export function InlineWaitlist({
  variant = 'light',
  className = '',
  buttonLabel = 'Get invite',
  inputId,
}: InlineWaitlistProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const referrerRef = useRef<string | null>(null);

  useEffect(() => {
    const ref = document.referrer;
    if (ref && !ref.startsWith(window.location.origin)) {
      referrerRef.current = ref;
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const utm = readUtm();
      const referrer = referrerRef.current;
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...utm, ...(referrer ? { referrer } : {}) }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? 'Something went wrong');
      }
      setSubmitted(email);
      toast.success("You're on the list — we'll be in touch");
      setEmail('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div
        className={`font-mono text-[12px] ${variant === 'dark' ? 'text-foreground/70 dark:text-background/70' : 'text-muted-foreground'} ${className}`}
      >
        <span className="text-brand">●</span> You&apos;re on the list.{' '}
        <span className="text-foreground/90 dark:text-background/90">{submitted}</span> noted.
      </div>
    );
  }

  if (variant === 'dark') {
    return (
      <form
        onSubmit={handleSubmit}
        className={`focus-within:ring-brand/40 focus-within:ring-offset-foreground dark:focus-within:ring-offset-background flex items-center gap-0 rounded-lg bg-neutral-800 p-1 transition-shadow focus-within:ring-2 focus-within:ring-offset-1 dark:bg-neutral-200 ${className}`}
      >
        <input
          id={inputId}
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your GitHub email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          aria-label="GitHub email address"
          className="text-background placeholder:text-background/40 h-9 min-w-[260px] flex-1 border-0 bg-transparent px-3.5 font-mono text-[13px] focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !email}
          className="bg-brand inline-flex h-9 items-center justify-center rounded-md px-4 font-mono text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Joining…' : `${buttonLabel} →`}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`border-border bg-background focus-within:border-foreground focus-within:ring-brand/30 flex max-w-[480px] overflow-hidden rounded-md border transition-shadow focus-within:ring-2 ${className}`}
    >
      <input
        id={inputId}
        type="email"
        required
        autoComplete="email"
        placeholder="Enter your GitHub email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        aria-label="GitHub email address"
        className="text-foreground placeholder:text-muted-foreground/70 h-10 flex-1 border-0 bg-transparent px-3.5 font-mono text-[13px] focus:outline-none disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={loading || !email}
        className="bg-foreground text-background inline-flex h-10 items-center justify-center px-4 font-mono text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Joining…' : buttonLabel}
      </button>
    </form>
  );
}
