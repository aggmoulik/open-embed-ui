const FEATURES = [
  {
    num: '01',
    title: 'Shadow DOM isolation',
    body: "Widget ships its own styles inside a Shadow DOM. No CSS leaks in, no CSS leaks out — drop it into a Tailwind site, a Hugo blog, or a hand-written README without surprises.",
  },
  {
    num: '02',
    title: 'Light, dark, or system',
    body: "Theme follows your visitor's OS preference automatically. Or pin it light / dark / per-embed. All 14 layouts ship both modes.",
  },
  {
    num: '03',
    title: 'Per-widget origin allowlist',
    body: 'Default-deny security. Declare exactly which domains can embed each widget — wildcards supported, leak alerts in your dashboard.',
  },
  {
    num: '04',
    title: 'Live API or static export',
    body: 'Mode A: dynamic via the edge worker. Mode B: bake a JSON snapshot into your CI for zero-runtime, fully cacheable embeds.',
  },
  {
    num: '05',
    title: 'Edge-deployed, <100 KB',
    body: 'Slim Cloudflare Worker (~96 KB gzipped) serves the live API. Widget itself stays under 19 KB gzipped on the wire.',
  },
  {
    num: '06',
    title: 'No iframes, no tracking',
    body: "Real DOM nodes you can style around. No third-party cookies, no analytics pings, no maintenance — and never any of your visitors' data.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="border-t border-border py-24" id="features">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11 max-w-[720px]">
          <div className="marketing-section-eyebrow mb-3 inline-block font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            04 · built for serious portfolios
          </div>
          <h2 className="font-sans text-[32px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[38px]">
            A widget that respects your site, your visitors, and your bundle size.
          </h2>
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-background sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const cols = 3;
            const onRight = (i + 1) % cols === 0;
            const inLastRow = i >= FEATURES.length - cols;
            return (
              <div
                key={f.num}
                className={`p-7 ${onRight ? '' : 'lg:border-r'} ${inLastRow ? '' : 'lg:border-b'} ${i % 2 === 1 ? 'sm:border-r-0 lg:border-r' : 'sm:border-r'} ${i >= FEATURES.length - 2 ? 'sm:border-b-0' : 'sm:border-b'} border-border`}
              >
                <div className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground/70">
                  {f.num} —
                </div>
                <h3 className="mb-2 mt-3.5 text-[16px] font-semibold tracking-[-0.01em]">
                  {f.title}
                </h3>
                <p className="m-0 text-[14px] leading-[1.55] text-muted-foreground">{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
