import { BookOpen, GitPullRequest } from '../icons';
import {
  getBlogTarget,
  getDisplayLabels,
  getLabelColor,
  safeHref,
  safeImgSrc,
} from '@open-embed-ui/types';
import type { BaseContribution as Contribution } from '@open-embed-ui/types';

interface SingleCardLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export function SingleCardLayout({ contributions, titleOverrides }: SingleCardLayoutProps) {
  const pr = contributions[0];
  if (!pr) return <EmptyState />;

  const displayTitle = pr.titleOverride || titleOverrides?.[pr.id] || pr.title;
  const avatarUrl = `https://github.com/${pr.repoOwner}.png?size=64`;
  // Hero layouts always render the kind label (auto-detected when the user
  // hasn't set explicit labels) — it anchors the card visually.
  const labels = getDisplayLabels(displayTitle, pr.labels);
  const blog = getBlogTarget(pr);
  const total = pr.additions + pr.deletions;
  const addPct = total === 0 ? 50 : (pr.additions / total) * 100;

  return (
    <div className="border-border bg-background overflow-hidden rounded-xl border">
      <div className="border-border bg-muted/30 flex items-center justify-between border-b border-dashed px-4 py-2">
        <span className="text-muted-foreground font-mono text-[10px] tracking-[0.08em] uppercase">
          // featured contribution
        </span>
        {pr.mergedAt && (
          <time
            className="text-muted-foreground/80 font-mono text-[10px] tracking-[0.08em] uppercase"
            dateTime={new Date(pr.mergedAt).toISOString()}
          >
            merged {shortDate(pr.mergedAt)}
          </time>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-violet/10 text-violet flex size-10 shrink-0 items-center justify-center rounded-full">
            <GitPullRequest className="size-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            {labels.length > 0 && (
              <div className="mb-2.5 flex flex-wrap gap-1.5">
                {labels.map((label) => {
                  const color = getLabelColor(label);
                  return (
                    <span
                      key={label}
                      className="rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.06em] text-white uppercase"
                      style={{ backgroundColor: color.light }}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            )}

            <div className="flex items-start gap-2">
              <a
                href={safeHref(pr.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground font-sans text-[20px] leading-[1.25] font-semibold tracking-[-0.02em] underline-offset-2 hover:underline"
              >
                {displayTitle}
              </a>
              {blog && (
                <a
                  href={safeHref(blog.href)}
                  target={blog.target}
                  rel={blog.rel}
                  className="text-muted-foreground/70 hover:text-foreground mt-1.5 shrink-0 transition-colors"
                  aria-label="Read blog post"
                  title="Read blog post"
                >
                  <BookOpen className="size-4" strokeWidth={1.75} />
                </a>
              )}
            </div>

            <a
              href={safeHref(`https://github.com/${pr.repo}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-1.5 font-mono text-[12px] transition-colors"
            >
              <img
                src={safeImgSrc(avatarUrl)}
                alt={pr.repoOwner}
                className="size-4 rounded-full"
                loading="lazy"
              />
              {pr.repo}
            </a>

            {pr.description && (
              <p className="text-muted-foreground mt-3.5 text-[14px] leading-[1.55]">
                {pr.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Diff stats footer */}
      <div className="border-border bg-muted/30 border-t border-dashed px-4 py-3">
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3">
          <div className="bg-border/60 relative h-1.5 overflow-hidden rounded-full">
            <div
              className="bg-brand absolute inset-y-0 left-0 rounded-l-full"
              style={{ width: `${addPct}%` }}
            />
            <div
              className="bg-danger absolute inset-y-0 right-0 rounded-r-full"
              style={{ width: `${100 - addPct}%` }}
            />
          </div>
          <span className="text-brand font-mono text-[12px] font-semibold">+{pr.additions}</span>
          <span className="text-danger font-mono text-[12px] font-semibold">−{pr.deletions}</span>
          <span className="text-muted-foreground font-mono text-[12px]">
            {pr.changedFiles} files
          </span>
        </div>
      </div>
    </div>
  );
}

function shortDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function EmptyState() {
  return (
    <div className="border-border bg-muted/20 text-muted-foreground flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center font-mono text-[12px]">
      <span className="text-brand">●</span>
      <span className="mt-1.5">No contributions match these filters.</span>
    </div>
  );
}
