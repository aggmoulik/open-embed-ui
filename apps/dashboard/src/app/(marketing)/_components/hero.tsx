import Link from 'next/link';
import { Badge } from '@open-embed-ui/ui/components/badge';
import { Button } from '@open-embed-ui/ui/components/button';
import { WaitlistForm } from './waitlist-form';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="from-background to-muted/30 absolute inset-0 -z-10 bg-gradient-to-b" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pt-28 lg:pb-28">
        {/* Left: copy + CTAs */}
        <div className="text-center lg:text-left">
          <Badge variant="outline" className="rounded-full">
            Now in private beta
          </Badge>
          <h1 className="text-foreground mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Show off your open-source PRs{' '}
            <span className="text-muted-foreground">anywhere</span>
          </h1>
          <p className="text-muted-foreground mt-5 max-w-xl text-base text-pretty sm:text-lg lg:mx-0 mx-auto">
            Drop a single React component — or one <code className="bg-muted rounded px-1.5 py-0.5 text-sm">&lt;script&gt;</code> tag —
            on your blog, portfolio, or README. Get a live, themed widget of your merged contributions. No iframes, no API keys, no maintenance.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Button asChild size="lg" variant="outline">
              <a href="#demo">See it live ↓</a>
            </Button>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>

        {/* Right: waitlist form */}
        <div className="lg:justify-self-end lg:max-w-md w-full">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
