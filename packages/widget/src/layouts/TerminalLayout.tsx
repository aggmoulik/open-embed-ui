import { getDisplayLabels, getLabelColor, getCleanTitle } from '../labels';
import { getBlogTarget } from '../blog';
import type { Contribution } from '../types';
import { safeHref } from '../lib/url-safe';

interface Props {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

/**
 * Git Receipt layout.
 *
 * Renders merged PRs as a thermal-printer receipt from a fictional dev POS
 * system — scalloped perforations, monospace everywhere, line items with
 * diff bars, subtotals, and a kicker. Dark-only by design (a thermal
 * receipt in light mode loses the character). Ignores the widget-level
 * theme setting.
 *
 * Shares no tailwind classes with the rest of the widget styles — see
 * `.geu-terminal-*` in `packages/widget/src/styles/widget.css`.
 */
export function TerminalLayout({ contributions, titleOverrides }: Props) {
  if (contributions.length === 0) {
    return <div class="geu-empty">No contributions to display</div>;
  }

  const totalAdd = contributions.reduce((n, c) => n + c.additions, 0);
  const totalDel = contributions.reduce((n, c) => n + c.deletions, 0);
  const totalFiles = contributions.reduce((n, c) => n + c.changedFiles, 0);
  const repoCount = new Set(contributions.map((c) => c.repo)).size;
  const now = new Date();

  // Deterministic 6-char receipt number from the set of PR ids.
  const receiptNo = receiptNumber(contributions.map((c) => c.id).join('|'));

  return (
    <div class="geu-terminal">
      <div class="geu-terminal-tear geu-terminal-tear-top" aria-hidden="true" />
      <div class="geu-terminal-paper">
        <div class="geu-terminal-scanlines" aria-hidden="true" />
        <header class="geu-terminal-header">
          <div class="geu-terminal-brand">GITHUB&nbsp;//&nbsp;EMBED&nbsp;UI</div>
          <div class="geu-terminal-rcpt">RCPT · {receiptNo}</div>
          <div class="geu-terminal-dashes" aria-hidden="true">
            {'- '.repeat(22).trim()}
          </div>
          <dl class="geu-terminal-meta">
            <div class="geu-terminal-meta-row">
              <dt>REGISTER</dt>
              <dd>main</dd>
            </div>
            <div class="geu-terminal-meta-row">
              <dt>ITEMS</dt>
              <dd>{String(contributions.length).padStart(3, '0')}</dd>
            </div>
            <div class="geu-terminal-meta-row">
              <dt>REPOS</dt>
              <dd>{String(repoCount).padStart(3, '0')}</dd>
            </div>
            <div class="geu-terminal-meta-row">
              <dt>DATE</dt>
              <dd>{isoStamp(now)}</dd>
            </div>
          </dl>
          <div class="geu-terminal-dashes" aria-hidden="true">
            {'- '.repeat(22).trim()}
          </div>
        </header>

        <ol class="geu-terminal-items">
          {contributions.map((c, i) => {
            const title = c.titleOverride || titleOverrides?.[c.id] || c.title;
            const labels = getDisplayLabels(title, c.labels);
            const cleanTitle = getCleanTitle(title, c.labels);
            const hash = shortHash(c.id);
            const total = c.additions + c.deletions;
            const addPct = total === 0 ? 50 : (c.additions / total) * 100;
            const delPct = 100 - addPct;
            return (
              <li key={c.id} class="geu-terminal-item">
                <div class="geu-terminal-line-top">
                  <span class="geu-terminal-idx">{String(i + 1).padStart(2, '0')}</span>
                  {labels.map((label) => {
                    const color = getLabelColor(label);
                    return (
                      <span
                        key={label}
                        class="geu-terminal-kind"
                        data-lbl
                        style={{
                          '--lbl-light': color.light,
                          '--lbl-dark': color.dark,
                        }}
                      >
                        {label}
                      </span>
                    );
                  })}
                  <a
                    href={safeHref(c.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="geu-terminal-title"
                    title={title}
                  >
                    {cleanTitle}
                  </a>
                  {(() => {
                    const blog = getBlogTarget(c);
                    if (!blog) return null;
                    return (
                      <a
                        href={safeHref(blog.href)}
                        target={blog.target}
                        rel={blog.rel}
                        style={{ marginLeft: '6px', color: 'currentColor', opacity: 0.55, fontSize: '10px', textDecoration: 'none', whiteSpace: 'nowrap' }}
                        title="Read blog post"
                      >
                        [blog↗]
                      </a>
                    );
                  })()}
                </div>
                {c.description && (
                  <div style={{ margin: '4px 0 0', paddingLeft: '24px', fontSize: '10px', opacity: 0.65, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {c.description}
                  </div>
                )}
                <div class="geu-terminal-line-mid">
                  <span class="geu-terminal-hash">#{hash}</span>
                  <span class="geu-terminal-sep">·</span>
                  <a
                    href={safeHref(`https://github.com/${c.repo}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="geu-terminal-repo"
                  >
                    {c.repo}
                  </a>
                  {c.mergedAt && (
                    <>
                      <span class="geu-terminal-sep">·</span>
                      <time class="geu-terminal-date" dateTime={c.mergedAt}>
                        {shortDate(c.mergedAt)}
                      </time>
                    </>
                  )}
                </div>
                <div class="geu-terminal-diff">
                  <div class="geu-terminal-diff-bar">
                    <div
                      class="geu-terminal-diff-add-seg"
                      style={{ width: `${addPct}%` }}
                    />
                    <div
                      class="geu-terminal-diff-del-seg"
                      style={{ width: `${delPct}%` }}
                    />
                  </div>
                  <span class="geu-terminal-diff-nums">
                    <span class="geu-terminal-add">+{c.additions}</span>
                    <span class="geu-terminal-del">-{c.deletions}</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        <footer class="geu-terminal-footer">
          <div class="geu-terminal-dashes geu-terminal-dashes-double" aria-hidden="true">
            {'= '.repeat(22).trim()}
          </div>
          <div class="geu-terminal-total-row">
            <span>SUBTOTAL</span>
            <span class="geu-terminal-total-value">
              {contributions.length} {contributions.length === 1 ? 'MERGE' : 'MERGES'}
            </span>
          </div>
          <div class="geu-terminal-total-row">
            <span>ADDITIONS</span>
            <span class="geu-terminal-total-value geu-terminal-add">
              +{formatNumber(totalAdd)}
            </span>
          </div>
          <div class="geu-terminal-total-row">
            <span>DELETIONS</span>
            <span class="geu-terminal-total-value geu-terminal-del">
              -{formatNumber(totalDel)}
            </span>
          </div>
          <div class="geu-terminal-total-row">
            <span>FILES&nbsp;TOUCHED</span>
            <span class="geu-terminal-total-value">{formatNumber(totalFiles)}</span>
          </div>
          <div class="geu-terminal-total-row geu-terminal-total-row-grand">
            <span>NET&nbsp;CHURN</span>
            <span class="geu-terminal-total-value">
              {formatNumber(totalAdd - totalDel)} LOC
            </span>
          </div>
          <div class="geu-terminal-dashes geu-terminal-dashes-double" aria-hidden="true">
            {'= '.repeat(22).trim()}
          </div>
          <div class="geu-terminal-kicker">** THANK YOU FOR MERGING **</div>
          <div class="geu-terminal-barcode" aria-hidden="true">
            {BARCODE_PATTERN.map((w, idx) => (
              <span
                key={idx}
                class="geu-terminal-barcode-bar"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
          <div class="geu-terminal-barcode-label">{receiptNo} · KEEP THIS RECEIPT</div>
        </footer>
      </div>
      <div class="geu-terminal-tear geu-terminal-tear-bottom" aria-hidden="true" />
    </div>
  );
}

// --- helpers -------------------------------------------------------------

/** djb2-ish deterministic 7-char hex from the PR id. */
function shortHash(id: string): string {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
}

/** Deterministic 6-char uppercase receipt number from the set of PR ids. */
function receiptNumber(seed: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0)
    .toString(36)
    .toUpperCase()
    .padStart(6, '0')
    .slice(-6);
}

/** YYYY-MM-DD · HH:MM format (no timezone — matches receipt aesthetic). */
function isoStamp(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Short MMM DD format for per-item timestamps. */
function shortDate(iso: string): string {
  const d = new Date(iso);
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
}

/** 1,234,567 with thin spaces to fit the receipt. */
function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/**
 * Hand-authored barcode pattern. Alternates 1/2/3px wide vertical bars
 * with 1px gaps to produce a believable (non-functional) CODE128-style
 * barcode. Not computed at render time so every receipt has the same
 * barcode — that's fine, it's decorative.
 */
const BARCODE_PATTERN = [
  1, 2, 1, 1, 3, 1, 2, 1, 1, 1, 2, 2, 1, 3, 1, 1, 1, 2, 1, 1, 3, 1, 2, 1, 1, 2,
  1, 1, 3, 1, 1, 2, 1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 3, 2, 1, 1, 1,
];
