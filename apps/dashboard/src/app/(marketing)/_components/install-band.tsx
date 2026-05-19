interface Target {
  name: string;
  status: 'ready' | 'soon';
}

const TARGETS: Target[] = [
  { name: '<script>', status: 'ready' },
  { name: 'React', status: 'ready' },
  { name: 'Astro', status: 'ready' },
  { name: 'Next.js', status: 'soon' },
  { name: 'Hugo', status: 'soon' },
  { name: 'Jekyll', status: 'soon' },
  { name: '11ty', status: 'soon' },
  { name: 'Notion', status: 'soon' },
  { name: 'Bear blog', status: 'soon' },
  { name: 'plain HTML', status: 'soon' },
  { name: 'README.md', status: 'soon' },
];

export function InstallBand() {
  return (
    <div className="border-border bg-muted/30 border-y py-9">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-7 gap-y-3 px-7">
        <span className="text-muted-foreground font-mono text-[11px] tracking-[0.08em] uppercase">
          Drops cleanly into →
        </span>
        <div className="flex flex-wrap gap-2">
          {TARGETS.map((t) => {
            const isReady = t.status === 'ready';
            return (
              <span
                key={t.name}
                className={
                  isReady
                    ? 'border-border bg-background text-foreground/90 inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 font-mono text-[12px] leading-none'
                    : 'border-border bg-muted/40 text-muted-foreground/70 inline-flex h-7 items-center gap-2 rounded-md border border-dashed px-2.5 font-mono text-[12px] leading-none'
                }
                title={isReady ? `${t.name} — available` : `${t.name} — coming soon`}
              >
                {isReady ? (
                  <span
                    aria-hidden="true"
                    className="bg-brand size-1.5 shrink-0 rounded-full"
                    style={{
                      boxShadow: '0 0 0 2px color-mix(in oklab, var(--brand) 18%, transparent)',
                    }}
                  />
                ) : null}
                <span
                  className={
                    isReady
                      ? 'leading-none'
                      : 'decoration-muted-foreground/40 leading-none line-through decoration-1 underline-offset-2'
                  }
                >
                  {t.name}
                </span>
                {!isReady && (
                  <span className="bg-muted text-muted-foreground/80 inline-flex h-4 items-center rounded-sm px-1 font-mono text-[10px] leading-none font-medium tracking-[0.06em] uppercase">
                    soon
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
