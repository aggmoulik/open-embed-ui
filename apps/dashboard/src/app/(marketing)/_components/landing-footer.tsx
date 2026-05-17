import Link from 'next/link';
import { Separator } from '@open-embed-ui/ui/components/separator';

export function LandingFooter() {
  return (
    <footer className="bg-background border-t">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <span aria-hidden="true" className="text-lg">◐</span>
              <span>Open Embed UI</span>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              Embeddable widgets for your open-source contributions.
            </p>
          </div>
          <div className="text-sm">
            <div className="text-foreground font-medium">Product</div>
            <ul className="text-muted-foreground mt-2 space-y-1.5">
              <li>
                <a href="#demo" className="hover:text-foreground">Live demo</a>
              </li>
              <li>
                <a href="#waitlist" className="hover:text-foreground">Waitlist</a>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground">Sign in</Link>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="text-foreground font-medium">Resources</div>
            <ul className="text-muted-foreground mt-2 space-y-1.5">
              <li>
                <a
                  href="https://github.com/aggmoulik/github-embed-ui"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  GitHub repo
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/aggmoulik/github-embed-ui/blob/main/docs/roadmap.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  Roadmap
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/aggmoulik/github-embed-ui/blob/main/docs/CHANGELOG.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  Changelog
                </a>
              </li>
            </ul>
          </div>
        </div>
        <Separator className="my-6" />
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} Open Embed UI. Built in public.
        </p>
      </div>
    </footer>
  );
}
