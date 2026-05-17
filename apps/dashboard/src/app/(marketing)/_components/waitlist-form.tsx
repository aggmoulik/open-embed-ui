'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@open-embed-ui/ui/components/button';
import { Input } from '@open-embed-ui/ui/components/input';
import { isValidEmail } from '@/lib/validation/email';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
            We&apos;ll email <span className="text-foreground font-mono break-all">{submitted}</span> when invites open.
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
