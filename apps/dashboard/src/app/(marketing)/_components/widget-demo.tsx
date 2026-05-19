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
    <section className="border-t border-border py-24" id="demo">
      <div className="mx-auto max-w-[1240px] px-7">
        <div className="mb-11 max-w-[720px]">
          <div className="marketing-section-eyebrow mb-3 inline-block font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            02 · live demo
          </div>
          <h2 className="mb-3 font-sans text-[32px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[38px]">
            This is the widget. Rendering right now.
          </h2>
          <p className="max-w-[620px] text-[16px] text-muted-foreground">
            Same React component, same data shape, same Shadow DOM as what you&apos;d embed. Real
            DOM nodes, real CSS isolation, real &lt;300ms first paint.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-[0_1px_0_rgba(0,0,0,.02),0_4px_16px_rgba(0,0,0,.05)]">
          <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-3.5 py-2.5">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-border" />
              <span className="size-2.5 rounded-full bg-border" />
              <span className="size-2.5 rounded-full bg-border" />
            </div>
            <div className="flex h-[26px] flex-1 items-center gap-0.5 rounded-md border border-border bg-background px-2.5 font-mono text-[12px] text-muted-foreground">
              <span>https://</span>
              <b className="font-semibold text-foreground">your-portfolio.dev</b>
              <span>/now</span>
            </div>
            <span className="rounded-[5px] border border-b-2 border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
              ⌘K
            </span>
          </div>

          <div className="marketing-dot-bg min-h-[360px] bg-background p-7">
            <div className="mx-auto max-w-[720px] rounded-[10px] border border-border bg-background p-4 shadow-[0_1px_0_rgba(0,0,0,.02),0_1px_2px_rgba(0,0,0,.04)]">
              <div className="mb-3 flex items-center justify-between border-b border-dashed border-border pb-3.5">
                <h4 className="m-0 font-mono text-[13px] font-medium text-muted-foreground">
                  <span className="font-semibold text-foreground">aggmoulik</span>
                  &nbsp;/&nbsp;recent merged PRs
                </h4>
                <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                  ▲ list · light
                </span>
              </div>

              {PRS.map((pr, i) => (
                <div
                  key={pr.title}
                  className={`grid grid-cols-[auto_1fr_auto_auto] items-center gap-3.5 px-1 py-3 ${
                    i < PRS.length - 1 ? 'border-b border-dashed border-border' : ''
                  }`}
                >
                  <GitBranch className="size-[18px] shrink-0 text-violet" strokeWidth={2} />
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-medium text-foreground">
                      <span className="font-mono text-violet">
                        {pr.tag}({pr.scope}):
                      </span>{' '}
                      {pr.title}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {pr.repo} · <span className="text-brand">+{pr.add}</span>{' '}
                      <span className="text-danger">−{pr.del}</span> · merged {pr.date}
                    </div>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${TAG_STYLES[pr.tag]}`}
                  >
                    {pr.tag}
                  </span>
                  <span className="hidden whitespace-nowrap font-mono text-[11px] text-muted-foreground/70 sm:inline">
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
