interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FEATURES: Feature[] = [
  {
    title: '14 polished layouts',
    description:
      'Grid, list, timeline, terminal, gitlog, devlog, scorecard, proof — pick the one that matches your site.',
    icon: <IconLayout />,
  },
  {
    title: 'Shadow DOM isolation',
    description:
      'The widget ships its own styles inside a Shadow DOM. No CSS leaks in, no CSS leaks out.',
    icon: <IconShield />,
  },
  {
    title: 'Light, dark, or system',
    description:
      'Theme follows your visitor’s OS preference automatically — or pin it light or dark per embed.',
    icon: <IconMoon />,
  },
  {
    title: 'Per-widget origin allowlist',
    description:
      'Default-deny security. Declare exactly which domains can embed each widget — wildcards supported.',
    icon: <IconLock />,
  },
  {
    title: 'Live API or static export',
    description:
      'Mode A: dynamic via our edge worker. Mode B: bake a static JSON into your CI for zero-runtime embeds.',
    icon: <IconBolt />,
  },
  {
    title: 'Edge-deployed, <100 KB',
    description:
      'Slim Cloudflare Worker (~96 KB gzipped) serves the live API. Widget itself stays under 19 KB gzipped.',
    icon: <IconCloud />,
  },
];

export function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for serious portfolios</h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
          A widget that respects your site, your visitors, and your bundle size.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="bg-card rounded-lg border p-6 transition-shadow hover:shadow-sm"
          >
            <div className="text-foreground mb-3">{feature.icon}</div>
            <h3 className="text-base font-semibold">{feature.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function IconLayout() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 2.5 4 5.5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10v-6L12 2.5Z" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" strokeLinejoin="round">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  );
}

function IconCloud() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M7 18h10a4 4 0 0 0 .5-7.97 6 6 0 0 0-11.66 1.3A4 4 0 0 0 7 18Z" />
    </svg>
  );
}
