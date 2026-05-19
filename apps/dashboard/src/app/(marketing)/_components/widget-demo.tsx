import { GitBranch } from 'lucide-react';

type PrTag = 'feat' | 'fix' | 'perf' | 'refactor';

interface Pr {
  tag: PrTag;
  scope: string;
  title: string;
  repo: string;
  add: number;
  del: number;
  date: string;
}

const PRS: Pr[] = [
  {
    tag: 'feat',
    scope: 'widget',
    title: 'add masonry layout with container queries',
    repo: 'aggmoulik/github-embed-ui',
    add: 287,
    del: 14,
    date: '2026-05-12',
  },
  {
    tag: 'fix',
    scope: 'embed',
    title: 'enforce per-widget origin allowlist',
    repo: 'aggmoulik/github-embed-ui',
    add: 94,
    del: 23,
    date: '2026-05-08',
  },
  {
    tag: 'perf',
    scope: 'widget',
    title: 'shave 4 KB off gzipped bundle',
    repo: 'aggmoulik/github-embed-ui',
    add: 31,
    del: 72,
    date: '2026-05-01',
  },
  {
    tag: 'refactor',
    scope: 'core',
    title: 'split renderer from data adapter',
    repo: 'aggmoulik/github-embed-ui',
    add: 412,
    del: 388,
    date: '2026-04-24',
  },
];

const TAG_STYLES: Record<PrTag, string> = {
  feat: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  fix: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  perf: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  refactor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
};

export function WidgetDemo() {
  return (
    <section className="border-border border-t py-16 sm:py-24" id="demo">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-7">
        <div className="mb-11 max-w-[720px]">
          <div className="marketing-section-eyebrow text-muted-foreground mb-3 inline-block font-mono text-[11px] tracking-[0.08em] uppercase">
            02 · live demo
          </div>
          <h2 className="mb-3 font-sans text-[32px] leading-[1.1] font-semibold tracking-[-0.025em] sm:text-[38px]">
            This is the widget. Rendering right now.
          </h2>
          <p className="text-muted-foreground max-w-[620px] text-[16px]">
            Same React component, same data shape, same Shadow DOM as what you&apos;d embed. Real
            DOM nodes, real CSS isolation, real &lt;300ms first paint.
          </p>
        </div>

        <div className="border-border bg-background overflow-hidden rounded-2xl border shadow-[0_1px_0_rgba(0,0,0,.02),0_4px_16px_rgba(0,0,0,.05)]">
          <div className="border-border bg-muted/40 flex items-center gap-2 border-b px-3 py-2.5 sm:gap-3 sm:px-3.5">
            <div className="flex shrink-0 gap-1.5">
              <span className="bg-border size-2.5 rounded-full" />
              <span className="bg-border size-2.5 rounded-full" />
              <span className="bg-border size-2.5 rounded-full" />
            </div>
            <div className="border-border bg-background text-muted-foreground flex h-[26px] min-w-0 flex-1 items-center gap-0.5 overflow-hidden rounded-md border px-2.5 font-mono text-[11px] sm:text-[12px]">
              <span>https://</span>
              <b className="text-foreground truncate font-semibold">your-portfolio.dev</b>
              <span>/now</span>
            </div>
            <span className="border-border bg-background text-foreground/80 hidden shrink-0 rounded-[5px] border border-b-2 px-1.5 py-0.5 font-mono text-[11px] sm:inline">
              ⌘K
            </span>
          </div>

          <div className="marketing-dot-bg bg-background min-h-[320px] p-4 sm:min-h-[360px] sm:p-7">
            <div className="border-border bg-background mx-auto max-w-[720px] rounded-[10px] border p-3 shadow-[0_1px_0_rgba(0,0,0,.02),0_1px_2px_rgba(0,0,0,.04)] sm:p-4">
              <div className="border-border mb-3 flex items-center justify-between border-b border-dashed pb-3.5">
                <h4 className="text-muted-foreground m-0 font-mono text-[13px] font-medium">
                  <span className="text-foreground font-semibold">aggmoulik</span>
                  &nbsp;/&nbsp;recent merged PRs
                </h4>
                <span className="border-border text-muted-foreground rounded-full border px-2 py-0.5 font-mono text-[11px]">
                  ▲ list · light
                </span>
              </div>

              {PRS.map((pr, i) => (
                <div
                  key={pr.title}
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-2.5 px-1 py-3 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-3.5 ${
                    i < PRS.length - 1 ? 'border-border border-b border-dashed' : ''
                  }`}
                >
                  <GitBranch className="text-violet size-[18px] shrink-0" strokeWidth={2} />
                  <div className="min-w-0">
                    <div className="text-foreground truncate text-[14px] font-medium">
                      <span className="text-violet font-mono">
                        {pr.tag}({pr.scope}):
                      </span>{' '}
                      {pr.title}
                    </div>
                    <div className="text-muted-foreground mt-0.5 font-mono text-[11px]">
                      {pr.repo} · <span className="text-brand">+{pr.add}</span>{' '}
                      <span className="text-danger">−{pr.del}</span> · merged {pr.date}
                    </div>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.06em] uppercase ${TAG_STYLES[pr.tag]}`}
                  >
                    {pr.tag}
                  </span>
                  <span className="text-muted-foreground/70 hidden font-mono text-[11px] whitespace-nowrap sm:inline">
                    {pr.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
