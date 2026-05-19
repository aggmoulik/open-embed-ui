// Mini-previews for each of the 12 production layouts. Visual-only — no real data.
// Mirrors `apps/dashboard/src/lib/layouts.ts` as the canonical list.
// `featured: true` → shipping in the public widget builder.
// `featured: false` → admin-only today, shown here with a SOON badge.

type BarProps = { w?: string; tone?: 'muted' | 'dark' | 'border'; h?: number };
function Bar({ w = '60%', tone = 'border', h = 6 }: BarProps) {
  const bg = tone === 'dark' ? 'bg-foreground' : 'bg-border';
  return <div className={`rounded-sm ${bg}`} style={{ width: w, height: h }} />;
}

function Tag({ t, bg, c }: { t: string; bg: string; c: string }) {
  return (
    <span
      className="rounded-sm px-1 py-px font-mono text-[8px] leading-tight"
      style={{ background: bg, color: c }}
    >
      {t}
    </span>
  );
}

function PList() {
  const items = [
    { t: 'feat', bg: '#ecfdf5', c: '#047857' },
    { t: 'fix', bg: '#fef2f2', c: '#b91c1c' },
    { t: 'perf', bg: '#fffbeb', c: '#b45309' },
    { t: 'refactor', bg: '#eef2ff', c: '#4338ca' },
  ];
  return (
    <div className="flex h-full flex-col gap-1.5">
      {items.map((it) => (
        <div key={it.t} className="flex items-center gap-1.5">
          <Tag t={it.t} bg={it.bg} c={it.c} />
          <Bar w="100%" tone="muted" h={5} />
        </div>
      ))}
    </div>
  );
}

function PGrid() {
  return (
    <div className="grid h-full grid-cols-3 gap-1.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-muted/60 flex flex-col gap-1 rounded-sm p-1">
          <Bar w="60%" h={3} />
          <Bar w="100%" h={3} />
        </div>
      ))}
    </div>
  );
}

function PTimeline() {
  return (
    <div className="relative h-full pl-3.5">
      <div className="bg-border absolute top-1 bottom-1 left-[5px] w-px" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="relative mb-2 flex flex-col gap-[3px]">
          <div className="border-muted/40 bg-foreground absolute top-1 -left-3 size-[7px] rounded-full border-2" />
          <Bar w="50%" tone="dark" h={4} />
          <Bar w="80%" h={3} />
        </div>
      ))}
    </div>
  );
}

function PSingleCard() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="border-border bg-background flex w-full flex-col gap-2 rounded-md border p-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <Tag t="feat" bg="#ecfdf5" c="#047857" />
          <Bar w="40%" h={3} />
        </div>
        <Bar w="100%" tone="dark" h={5} />
        <Bar w="85%" h={3} />
        <Bar w="60%" h={3} />
        <div className="mt-1 flex items-center justify-between">
          <Bar w="30%" h={3} />
          <span className="text-muted-foreground font-mono text-[7px]">+287 −14</span>
        </div>
      </div>
    </div>
  );
}

function PHighlight() {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="border-border bg-background flex flex-1 flex-col gap-1.5 rounded-sm border p-2 shadow-sm">
        <Tag t="featured" bg="#fffbeb" c="#b45309" />
        <Bar w="80%" tone="dark" h={4} />
        <Bar w="100%" h={3} />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[0, 1].map((i) => (
          <div key={i} className="bg-muted/60 flex flex-col gap-1 rounded-sm p-1.5">
            <Bar w="70%" h={3} />
            <Bar w="100%" h={2} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PMarquee() {
  const items = [
    { t: 'feat', bg: '#ecfdf5', c: '#047857' },
    { t: 'fix', bg: '#fef2f2', c: '#b91c1c' },
    { t: 'perf', bg: '#fffbeb', c: '#b45309' },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-1.5">
      {items.map((it) => (
        <div key={it.t} className="flex items-center gap-1.5">
          <Tag t={it.t} bg={it.bg} c={it.c} />
          <Bar w="100%" h={3} />
        </div>
      ))}
      <div className="text-muted-foreground/70 mt-0.5 font-mono text-[7px]">→ scrolling</div>
    </div>
  );
}

function PMasonry() {
  return (
    <div className="grid h-full grid-cols-2 gap-1.5">
      <div className="flex flex-col gap-1.5">
        <div className="bg-muted/60 flex flex-col gap-1 rounded-sm p-1.5">
          <Bar w="70%" h={3} />
          <Bar w="100%" h={3} />
          <Bar w="80%" h={3} />
        </div>
        <div className="bg-muted/60 flex flex-col gap-1 rounded-sm p-1.5">
          <Bar w="50%" h={3} />
          <Bar w="100%" h={3} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="bg-muted/60 flex flex-col gap-1 rounded-sm p-1.5">
          <Bar w="80%" h={3} />
          <Bar w="100%" h={3} />
        </div>
        <div className="bg-muted/60 flex flex-col gap-1 rounded-sm p-1.5">
          <Bar w="60%" h={3} />
          <Bar w="100%" h={3} />
          <Bar w="100%" h={3} />
          <Bar w="70%" h={3} />
        </div>
      </div>
    </div>
  );
}

function PReceipt() {
  return (
    <div
      className="relative h-full rounded-[2px] p-2 font-mono leading-[1.6]"
      style={{ background: '#fdfcf9', color: '#3f3f46', fontSize: 7 }}
    >
      <div
        className="pb-1 text-center font-bold"
        style={{ borderBottom: '1px dashed #d4d4d8', marginBottom: 4 }}
      >
        ** OPEN EMBED **
      </div>
      <div className="flex justify-between">
        <span>feat masonry</span>
        <span>+287</span>
      </div>
      <div className="flex justify-between">
        <span>fix origin</span>
        <span>+94</span>
      </div>
      <div className="flex justify-between">
        <span>perf bundle</span>
        <span>+31</span>
      </div>
      <div
        className="mt-1 flex justify-between pt-1 font-bold"
        style={{ borderTop: '1px dashed #d4d4d8' }}
      >
        <span>TOTAL</span>
        <span>+412</span>
      </div>
    </div>
  );
}

function PScorecard() {
  const stats = [
    { n: '47', l: 'merged' },
    { n: '12', l: 'repos' },
    { n: '8.4k', l: 'added' },
    { n: '2.1k', l: 'removed' },
  ];
  return (
    <div className="grid h-full grid-cols-2 gap-1.5">
      {stats.map((s) => (
        <div
          key={s.l}
          className="border-border bg-background flex flex-col justify-center rounded-sm border p-1.5"
        >
          <div className="text-foreground font-mono text-[14px] leading-none font-bold">{s.n}</div>
          <div className="text-muted-foreground font-mono text-[7px] tracking-[0.06em] uppercase">
            {s.l}
          </div>
        </div>
      ))}
    </div>
  );
}

function PGitlog() {
  return (
    <div className="font-mono leading-[1.5]" style={{ fontSize: 8 }}>
      {['a3f2c1', 'b9e201', 'c8d7e0', 'd6e423'].map((h) => (
        <div key={h} className="mb-1 flex items-center gap-1.5">
          <span className="text-warn">●</span>
          <span className="text-violet">{h}</span>
          <Bar w="60%" h={3} />
        </div>
      ))}
    </div>
  );
}

function PDevlog() {
  return (
    <div className="flex flex-col gap-2">
      {['MAY 12', 'MAY 08'].map((d) => (
        <div key={d} className="border-foreground border-l-2 pl-2">
          <div className="text-muted-foreground font-mono text-[8px]">{d}</div>
          <Bar w="90%" tone="dark" h={4} />
          <div className="mt-0.5 flex flex-col gap-0.5">
            <Bar w="100%" h={2} />
            <Bar w="80%" h={2} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PProof() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
      <div className="text-muted-foreground font-mono text-[8px]">VERIFIED CONTRIBUTOR</div>
      <div className="text-foreground font-serif text-[16px] leading-none italic">aggmoulik</div>
      <div className="text-muted-foreground font-mono text-[7px]">
        47 merged · 12 repos · since 2021
      </div>
    </div>
  );
}

interface LayoutEntry {
  name: string;
  slug: string;
  Preview: () => React.ReactElement;
  featured: boolean;
}

// Order + featured flag mirror apps/dashboard/src/lib/layouts.ts exactly.
const LAYOUTS: LayoutEntry[] = [
  { name: 'Grid', slug: 'layouts/grid', Preview: PGrid, featured: true },
  { name: 'List', slug: 'layouts/list', Preview: PList, featured: true },
  { name: 'Timeline', slug: 'layouts/timeline', Preview: PTimeline, featured: true },
  { name: 'Single Card', slug: 'layouts/single-card', Preview: PSingleCard, featured: true },
  { name: 'Marquee', slug: 'layouts/marquee', Preview: PMarquee, featured: true },
  { name: 'Masonry', slug: 'layouts/masonry', Preview: PMasonry, featured: true },
  { name: 'Highlight', slug: 'layouts/highlight', Preview: PHighlight, featured: true },
  { name: 'Receipt', slug: 'layouts/terminal', Preview: PReceipt, featured: false },
  { name: 'Scorecard', slug: 'layouts/scorecard', Preview: PScorecard, featured: false },
  { name: 'Git Log', slug: 'layouts/gitlog', Preview: PGitlog, featured: false },
  { name: 'Dev Log', slug: 'layouts/devlog', Preview: PDevlog, featured: false },
  { name: 'Proof of Work', slug: 'layouts/proof', Preview: PProof, featured: false },
];

const FEATURED_LAYOUTS = LAYOUTS.filter((l) => l.featured);

export function LayoutGallery() {
  return (
    <section className="border-border bg-muted/30 border-t py-16 sm:py-24" id="layouts">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-7">
        <div className="mb-9 max-w-[720px] sm:mb-11">
          <div className="marketing-section-eyebrow text-muted-foreground mb-3 inline-block font-mono text-[11px] tracking-[0.08em] uppercase">
            03 · {FEATURED_LAYOUTS.length} layouts in production
          </div>
          <h2 className="mb-3 font-sans text-[32px] leading-[1.1] font-semibold tracking-[-0.025em] sm:text-[38px]">
            Pick the one that matches your site.
          </h2>
          <p className="text-muted-foreground max-w-[620px] text-[16px]">
            Content-first, screen-reader-friendly, and shipping in both light and dark out of the
            box. Switch with a single attribute change — no rebuild required.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {FEATURED_LAYOUTS.map((L, i) => {
            const num = String(i + 1).padStart(2, '0');
            const Preview = L.Preview;
            return (
              <div
                key={L.name}
                className="group border-border bg-background hover:border-foreground/30 flex cursor-pointer flex-col overflow-hidden rounded-[10px] border transition-all hover:-translate-y-px hover:shadow-[0_1px_0_rgba(0,0,0,.02),0_4px_16px_rgba(0,0,0,.05)]"
              >
                <div className="border-border bg-muted/40 relative flex aspect-[4/3] flex-col gap-2 overflow-hidden border-b p-3.5">
                  <Preview />
                </div>
                <div className="flex flex-col items-start gap-0.5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2.5">
                  <div className="text-foreground font-mono text-[12px] font-semibold">
                    {L.name}
                  </div>
                  <div className="text-muted-foreground/70 font-mono text-[10px]">
                    {num} · {L.slug}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
