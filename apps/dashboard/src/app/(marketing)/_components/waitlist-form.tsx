'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@open-embed-ui/ui/components/button';
import { Input } from '@open-embed-ui/ui/components/input';
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

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  // Capture the external referrer at mount, before any in-app navigation can
  // overwrite document.referrer. Same-origin referrers are dropped — a visitor
  // bouncing between /login and / shouldn't count as a "source".
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

  return (
    <div id="waitlist" className="bg-card w-full rounded-2xl border p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-semibold tracking-tight">Get early access</h2>
      <p className="text-muted-foreground mt-1.5 text-sm">
        Drop your email — we&apos;ll send an invite when public signups open.
      </p>

      {submitted ? (
        <div className="bg-muted/40 mt-5 rounded-lg border p-4 text-sm">
          <p className="font-medium">You&apos;re on the list.</p>
          <p className="text-muted-foreground mt-1">
            We&apos;ll email{' '}
            <span className="text-foreground font-mono break-all">{submitted}</span> when invites
            open.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-2.5">
          <Input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            disabled={loading}
            className="h-11"
            aria-label="Email address"
          />
          <Button type="submit" size="lg" className="w-full" disabled={loading || !email}>
            {loading ? 'Joining…' : 'Join the waitlist'}
          </Button>
        </form>
      )}

      <p className="text-muted-foreground mt-4 text-xs">
        No spam. One email when invites open. Unsubscribe anytime.
      </p>
    </div>
  );
}
