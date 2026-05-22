const FEATURES = [
  {
    num: '01',
    title: 'Shadow DOM isolation',
    body: 'Widget ships its own styles inside a Shadow DOM. No CSS leaks in, no CSS leaks out — drop it into a Tailwind site, a Hugo blog, or a hand-written README without surprises.',
  },
  {
    num: '02',
    title: 'Themes that match your brand',
    body: "Pick any accent, background, border, or muted color. Per-token overrides mean the widget fits portfolios, docs sites, and dark-mode blogs alike — light, dark, or system mode follows your visitor's OS automatically.",
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
    <section className="border-border border-t py-16 sm:py-24" id="features">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-7">
        <div className="mb-9 max-w-[720px] sm:mb-11">
          <div className="marketing-section-eyebrow text-muted-foreground mb-3 inline-block font-mono text-[11px] tracking-[0.08em] uppercase">
            04 · built for serious portfolios
          </div>
          <h2 className="font-sans text-[32px] leading-[1.1] font-semibold tracking-[-0.025em] sm:text-[38px]">
            A widget that respects your site, your visitors, and your bundle size.
          </h2>
        </div>

        <div className="border-border bg-background grid grid-cols-1 overflow-hidden rounded-xl border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            // sm = 2 cols, lg = 3 cols. Borders are *inner* dividers only —
            // the outer container provides the rounded perimeter. A cell's
            // right/bottom border is suppressed when it sits on the right
            // edge or in the last row at that breakpoint.
            const total = FEATURES.length;
            const onSmRight = i % 2 === 1;
            const onLgRight = (i + 1) % 3 === 0;
            const inSmLastRow = i >= total - (total % 2 === 0 ? 2 : 1);
            const inLgLastRow = i >= total - 3;

            const cls = [
              'p-5 sm:p-7',
              'border-border',
              !onSmRight && 'sm:border-r',
              !inSmLastRow && 'sm:border-b',
              // Cell was sm-right-edge but isn't lg-right-edge → need to ADD r at lg
              onSmRight && !onLgRight && 'lg:border-r',
              // Cell was sm-bottom-edge but isn't lg-bottom-edge → need to ADD b at lg
              inSmLastRow && !inLgLastRow && 'lg:border-b',
              // Cell has a sm:border-r but IS lg-right-edge → strip at lg
              !onSmRight && onLgRight && 'lg:border-r-0',
              // Cell has a sm:border-b but IS lg-bottom-edge → strip at lg
              !inSmLastRow && inLgLastRow && 'lg:border-b-0',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div key={f.num} className={cls}>
                <div className="text-muted-foreground/70 font-mono text-[11px] tracking-[0.08em]">
                  {f.num} —
                </div>
                <h3 className="mt-3.5 mb-2 text-[16px] font-semibold tracking-[-0.01em]">
                  {f.title}
                </h3>
                <p className="text-muted-foreground m-0 text-[14px] leading-[1.55]">{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
