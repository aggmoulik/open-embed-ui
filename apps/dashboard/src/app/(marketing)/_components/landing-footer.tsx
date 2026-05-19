import Link from 'next/link';

const VERSION_LABEL = 'private beta';

// Same handle is used across all three platforms today. Swap any URL here if
// a different account is later set up.
const SOCIALS = {
  github: 'https://github.com/aggmoulik',
  linkedin: 'https://www.linkedin.com/in/aggmoulik',
  twitter: 'https://x.com/aggmoulik',
};

const PRODUCT = [
  { href: '#demo', label: 'Live demo' },
  { href: '#layouts', label: 'Layouts' },
  { href: '/login', label: 'Sign in' },
];

const BUILT_BY = [
  { href: SOCIALS.github, label: 'GitHub', external: true },
  { href: SOCIALS.linkedin, label: 'LinkedIn', external: true },
  { href: SOCIALS.twitter, label: 'Twitter / X', external: true },
];

export function LandingFooter() {
  return (
    <footer className="border-border bg-muted/40 border-t pt-14 pb-9">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <div className="mb-3.5 flex items-center gap-2.5 font-mono text-[13px] font-semibold tracking-[-0.01em]">
              <span
                aria-hidden="true"
                className="bg-foreground text-background grid size-[22px] place-items-center rounded-[5px] font-mono text-[12px] font-bold"
              >
                ⌥
              </span>
              <span>openembed/ui</span>
            </div>
            <p className="text-muted-foreground m-0 max-w-[320px] text-[14px]">
              Embeddable widgets for your open-source contributions. A closed-beta product by{' '}
              <a
                href="https://github.com/aggmoulik"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2"
              >
                @aggmoulik
              </a>
              .
            </p>
          </div>

          <FooterColumn title="Product" items={PRODUCT} />
          <FooterColumn title="Built by" items={BUILT_BY} />
        </div>

        <div className="border-border text-muted-foreground mt-14 flex flex-wrap items-center justify-between gap-3 border-t pt-6 font-mono text-[11px]">
          <span>
            © {new Date().getFullYear()} Open Embed UI · a project by{' '}
            <a
              href="https://github.com/aggmoulik"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground"
            >
              @aggmoulik
            </a>
          </span>
          {/*
            Status pill is gated until we have real uptime monitoring (LP-05).
            Re-enable when Sentry + uptime monitors are live so we don't lie
            about the system state.
            <span className="flex items-center gap-2">
              <span className="bg-brand size-[7px] rounded-full" />
              all systems operational · {VERSION_LABEL}
            </span>
          */}
          <span className="text-muted-foreground/70">{VERSION_LABEL}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { href: string; label: string; external?: boolean }[];
}) {
  return (
    <div>
      <h5 className="text-muted-foreground/70 m-0 mb-3.5 font-mono text-[11px] font-semibold tracking-[0.08em] uppercase">
        {title}
      </h5>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {items.map((it) => {
          const external =
            it.external || it.href.startsWith('http') || it.href.startsWith('mailto:');
          return (
            <li key={it.label}>
              {external ? (
                <a
                  href={it.href}
                  target={it.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={it.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  className="text-muted-foreground hover:text-foreground text-[14px] transition-colors"
                >
                  {it.label}
                </a>
              ) : (
                <Link
                  href={it.href}
                  className="text-muted-foreground hover:text-foreground text-[14px] transition-colors"
                >
                  {it.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
