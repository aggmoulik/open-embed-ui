'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@open-embed-ui/ui/components/button';
import { Input } from '@open-embed-ui/ui/components/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@open-embed-ui/ui/components/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);

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
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Open Embed UI</CardTitle>
          <CardDescription>Sign in to showcase your open-source contributions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full gap-2" size="lg" onClick={handleGitHubLogin}>
            <GitHubIcon />
            Sign in with GitHub
          </Button>

          {process.env.NODE_ENV === 'development' && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background text-muted-foreground px-2">dev only</span>
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="dev@localhost.dev"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    e.key === 'Enter' && handleMagicLink()
                  }
                />
                <Button
                  className="w-full"
                  variant="outline"
                  size="lg"
                  onClick={handleMagicLink}
                  disabled={loading || !email}
                >
                  {loading ? 'Sending...' : 'Send Magic Link'}
                </Button>
              </div>

              {magicLinkSent && (
                <p className="text-muted-foreground text-center text-sm">
                  Check your terminal for the magic link
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
