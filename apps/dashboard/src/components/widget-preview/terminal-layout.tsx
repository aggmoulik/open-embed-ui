import { getDisplayLabels, getLabelColor, getCleanTitle } from '@github-embed-ui/types';
import type { Contribution } from '@/types';

interface TerminalLayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

/**
 * Dashboard preview mirror of `packages/widget/src/layouts/TerminalLayout.tsx`.
 *
 * Renders the same "git receipt" aesthetic but uses inline styles + a
 * dedicated stylesheet block in `apps/dashboard/src/app/globals.css`. The
 * DOM shape is identical to the widget-package version so the CSS from
 * that package's widget.css could be reused directly — but we duplicate
 * the geu-terminal-* block into globals.css so the dashboard doesn't have
 * to ship the entire widget bundle just to preview.
 *
 * Dark-only by design. Ignores theme setting.
 */
export function TerminalLayout({ contributions, titleOverrides }: TerminalLayoutProps) {
  if (contributions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        No contributions match these filters.
      </div>
    );
  }

  const totalAdd = contributions.reduce((n, c) => n + c.additions, 0);
  const totalDel = contributions.reduce((n, c) => n + c.deletions, 0);
  const totalFiles = contributions.reduce((n, c) => n + c.changedFiles, 0);
  const repoCount = new Set(contributions.map((c) => c.repo)).size;
  const now = new Date();
  const receiptNo = receiptNumber(contributions.map((c) => c.id).join('|'));

  return (
    <div className="geu-terminal">
      <div className="geu-terminal-tear geu-terminal-tear-top" aria-hidden="true" />
      <div className="geu-terminal-paper">
        <div className="geu-terminal-scanlines" aria-hidden="true" />
        <header className="geu-terminal-header">
          <div className="geu-terminal-brand">GITHUB&nbsp;//&nbsp;EMBED&nbsp;UI</div>
          <div className="geu-terminal-rcpt">RCPT · {receiptNo}</div>
          <div className="geu-terminal-dashes" aria-hidden="true">
            {'- '.repeat(22).trim()}
          </div>
          <dl className="geu-terminal-meta">
            <div className="geu-terminal-meta-row">
              <dt>REGISTER</dt>
              <dd>main</dd>
            </div>
            <div className="geu-terminal-meta-row">
              <dt>ITEMS</dt>
              <dd>{String(contributions.length).padStart(3, '0')}</dd>
            </div>
            <div className="geu-terminal-meta-row">
              <dt>REPOS</dt>
              <dd>{String(repoCount).padStart(3, '0')}</dd>
            </div>
            <div className="geu-terminal-meta-row">
              <dt>DATE</dt>
              <dd>{isoStamp(now)}</dd>
            </div>
          </dl>
          <div className="geu-terminal-dashes" aria-hidden="true">
            {'- '.repeat(22).trim()}
          </div>
        </header>

        <ol className="geu-terminal-items">
          {contributions.map((c, i) => {
            const title = titleOverrides?.[c.id] || c.title;
            const labels = getDisplayLabels(title, c.labels);
            const cleanTitle = getCleanTitle(title, c.labels);
            const hash = shortHash(c.id);
            const total = c.additions + c.deletions;
            const addPct = total === 0 ? 50 : (c.additions / total) * 100;
            const delPct = 100 - addPct;
            return (
              <li key={c.id} className="geu-terminal-item">
                <div className="geu-terminal-line-top">
                  <span className="geu-terminal-idx">{String(i + 1).padStart(2, '0')}</span>
                  {labels.map((label) => {
                    const color = getLabelColor(label);
                    return (
                      <span
                        key={label}
                        className="geu-terminal-kind"
                        data-lbl
                        style={{
                          '--lbl-light': color.light,
                          '--lbl-dark': color.dark,
                        } as React.CSSProperties}
                      >
                        {label}
                      </span>
                    );
                  })}
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="geu-terminal-title"
                    title={title}
                  >
                    {cleanTitle}
                  </a>
                </div>
                <div className="geu-terminal-line-mid">
                  <span className="geu-terminal-hash">#{hash}</span>
                  <span className="geu-terminal-sep">·</span>
                  <a
                    href={`https://github.com/${c.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="geu-terminal-repo"
                  >
                    {c.repo}
                  </a>
                  {c.mergedAt && (
                    <>
                      <span className="geu-terminal-sep">·</span>
                      <time
                        className="geu-terminal-date"
                        dateTime={new Date(c.mergedAt).toISOString()}
                      >
                        {shortDate(c.mergedAt)}
                      </time>
                    </>
                  )}
                </div>
                <div className="geu-terminal-diff">
                  <div className="geu-terminal-diff-bar">
                    <div
                      className="geu-terminal-diff-add-seg"
                      style={{ width: `${addPct}%` }}
                    />
                    <div
                      className="geu-terminal-diff-del-seg"
                      style={{ width: `${delPct}%` }}
                    />
                  </div>
                  <span className="geu-terminal-diff-nums">
                    <span className="geu-terminal-add">+{c.additions}</span>
                    <span className="geu-terminal-del">-{c.deletions}</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        <footer className="geu-terminal-footer">
          <div
            className="geu-terminal-dashes geu-terminal-dashes-double"
            aria-hidden="true"
          >
            {'= '.repeat(22).trim()}
          </div>
          <div className="geu-terminal-total-row">
            <span>SUBTOTAL</span>
            <span className="geu-terminal-total-value">
              {contributions.length} {contributions.length === 1 ? 'MERGE' : 'MERGES'}
            </span>
          </div>
          <div className="geu-terminal-total-row">
            <span>ADDITIONS</span>
            <span className="geu-terminal-total-value geu-terminal-add">
              +{formatNumber(totalAdd)}
            </span>
          </div>
          <div className="geu-terminal-total-row">
            <span>DELETIONS</span>
            <span className="geu-terminal-total-value geu-terminal-del">
              -{formatNumber(totalDel)}
            </span>
          </div>
          <div className="geu-terminal-total-row">
            <span>FILES&nbsp;TOUCHED</span>
            <span className="geu-terminal-total-value">{formatNumber(totalFiles)}</span>
          </div>
          <div className="geu-terminal-total-row geu-terminal-total-row-grand">
            <span>NET&nbsp;CHURN</span>
            <span className="geu-terminal-total-value">
              {formatNumber(totalAdd - totalDel)} LOC
            </span>
          </div>
          <div
            className="geu-terminal-dashes geu-terminal-dashes-double"
            aria-hidden="true"
          >
            {'= '.repeat(22).trim()}
          </div>
          <div className="geu-terminal-kicker">** THANK YOU FOR MERGING **</div>
          <div className="geu-terminal-barcode" aria-hidden="true">
            {BARCODE_PATTERN.map((w, idx) => (
              <span
                key={idx}
                className="geu-terminal-barcode-bar"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
          <div className="geu-terminal-barcode-label">{receiptNo} · KEEP THIS RECEIPT</div>
        </footer>
      </div>
      <div className="geu-terminal-tear geu-terminal-tear-bottom" aria-hidden="true" />
    </div>
  );
}

// --- helpers (mirrors packages/widget/src/layouts/TerminalLayout.tsx) ----

function shortHash(id: string): string {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
}

function receiptNumber(seed: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(-6);
}

function isoStamp(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function shortDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const MONTHS = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

const BARCODE_PATTERN = [
  1, 2, 1, 1, 3, 1, 2, 1, 1, 1, 2, 2, 1, 3, 1, 1, 1, 2, 1, 1, 3, 1, 2, 1, 1, 2,
  1, 1, 3, 1, 1, 2, 1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 3, 2, 1, 1, 1,
];
