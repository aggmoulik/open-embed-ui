'use client';

import { useState } from 'react';

type TokenCls =
  | 'tk-tag'
  | 'tk-attr'
  | 'tk-str'
  | 'tk-kw'
  | 'tk-fn'
  | 'tk-com'
  | 'tk-num'
  | 'tk-punc';
type Token = [TokenCls, string];
/** A single rendered code line. `noCopy: true` → render but exclude from clipboard. */
type Line = { tokens: Token[]; noCopy?: boolean };
type Snippet = { id: string; label: string; lines: Line[]; hidden?: boolean };

const TOKEN_CLS: Record<TokenCls, string> = {
  'tk-tag': 'text-pink-700 dark:text-pink-400',
  'tk-attr': 'text-amber-700 dark:text-amber-400',
  'tk-str': 'text-emerald-700 dark:text-emerald-400',
  'tk-kw': 'text-violet',
  'tk-fn': 'text-blue-700 dark:text-blue-400',
  'tk-com': 'italic text-muted-foreground',
  'tk-num': 'text-amber-700 dark:text-amber-400',
  'tk-punc': 'text-muted-foreground',
};

// `hidden: true` is kept in source for when a feature lands later — filtered out
// of the public tabs via SNIPPETS below. Static/CI is gated until the CLI ships.
const ALL_SNIPPETS: Snippet[] = [
  {
    id: 'script',
    label: '<script>',
    lines: [
      { tokens: [['tk-com', '// drop this anywhere on your page']] },
      {
        tokens: [
          ['tk-punc', '<'],
          ['tk-tag', 'script'],
          ['tk-punc', ' '],
          ['tk-attr', 'src'],
          ['tk-punc', '='],
          ['tk-str', '"https://embed.openembed.dev/v0/widget.js"'],
        ],
      },
      {
        tokens: [
          ['tk-punc', '        '],
          ['tk-attr', 'data-user'],
          ['tk-punc', '='],
          ['tk-str', '"aggmoulik"'],
        ],
      },
      {
        tokens: [
          ['tk-punc', '        '],
          ['tk-attr', 'data-layout'],
          ['tk-punc', '='],
          ['tk-str', '"list"'],
        ],
      },
      {
        tokens: [
          ['tk-punc', '        '],
          ['tk-attr', 'data-theme'],
          ['tk-punc', '='],
          ['tk-str', '"auto"'],
        ],
      },
      {
        tokens: [
          ['tk-punc', '        '],
          ['tk-attr', 'defer'],
          ['tk-punc', '>'],
          ['tk-punc', '</'],
          ['tk-tag', 'script'],
          ['tk-punc', '>'],
        ],
      },
      // Display-only footer: helpful context for the reader, not part of the
      // copy-paste payload.
      { tokens: [['tk-com', '']], noCopy: true },
      { tokens: [['tk-com', '// 19 KB gzipped · Shadow DOM · zero deps']], noCopy: true },
    ],
  },
  {
    id: 'react',
    label: 'React',
    lines: [
      {
        tokens: [
          ['tk-kw', 'import'],
          ['tk-punc', ' { '],
          ['tk-fn', 'PRStream'],
          ['tk-punc', ' } '],
          ['tk-kw', 'from'],
          ['tk-punc', ' '],
          ['tk-str', "'@openembed/react'"],
          ['tk-punc', ';'],
        ],
      },
      { tokens: [['tk-com', '']] },
      {
        tokens: [
          ['tk-kw', 'export default function '],
          ['tk-fn', 'Portfolio'],
          ['tk-punc', '() {'],
        ],
      },
      {
        tokens: [
          ['tk-punc', '  '],
          ['tk-kw', 'return'],
          ['tk-punc', ' ('],
        ],
      },
      {
        tokens: [
          ['tk-punc', '    <'],
          ['tk-tag', 'PRStream'],
        ],
      },
      {
        tokens: [
          ['tk-punc', '      '],
          ['tk-attr', 'user'],
          ['tk-punc', '='],
          ['tk-punc', '{'],
          ['tk-str', '"aggmoulik"'],
          ['tk-punc', '}'],
        ],
      },
      {
        tokens: [
          ['tk-punc', '      '],
          ['tk-attr', 'layout'],
          ['tk-punc', '='],
          ['tk-punc', '{'],
          ['tk-str', '"timeline"'],
          ['tk-punc', '}'],
        ],
      },
      {
        tokens: [
          ['tk-punc', '      '],
          ['tk-attr', 'limit'],
          ['tk-punc', '='],
          ['tk-punc', '{'],
          ['tk-num', '8'],
          ['tk-punc', '}'],
        ],
      },
      {
        tokens: [
          ['tk-punc', '      '],
          ['tk-attr', 'theme'],
          ['tk-punc', '='],
          ['tk-punc', '{'],
          ['tk-str', '"new-york"'],
          ['tk-punc', '}'],
          ['tk-punc', ' />'],
        ],
      },
      { tokens: [['tk-punc', '  );']] },
      { tokens: [['tk-punc', '}']] },
    ],
  },
  // Hidden until the `openembed` CLI ships. Keep the snippet in source so we
  // can flip `hidden: false` in one line when the export command lands.
  {
    id: 'static',
    label: 'Static / CI',
    hidden: true,
    lines: [
      { tokens: [['tk-com', '# generate a frozen JSON snapshot in CI']] },
      {
        tokens: [
          ['tk-fn', 'npx'],
          ['tk-punc', ' openembed export '],
          ['tk-punc', '\\'],
        ],
      },
      {
        tokens: [
          ['tk-punc', '  --user '],
          ['tk-str', 'aggmoulik'],
          ['tk-punc', ' \\'],
        ],
      },
      {
        tokens: [
          ['tk-punc', '  --out '],
          ['tk-str', 'public/prs.json'],
          ['tk-punc', ' \\'],
        ],
      },
      {
        tokens: [
          ['tk-punc', '  --since '],
          ['tk-str', '90d'],
        ],
      },
      { tokens: [['tk-com', '']] },
      { tokens: [['tk-com', '# then point the widget at the static file']] },
      {
        tokens: [
          ['tk-punc', '<'],
          ['tk-tag', 'pr-stream'],
          ['tk-punc', ' '],
          ['tk-attr', 'src'],
          ['tk-punc', '='],
          ['tk-str', '"/prs.json"'],
          ['tk-punc', '></'],
          ['tk-tag', 'pr-stream'],
          ['tk-punc', '>'],
        ],
      },
    ],
  },
];

const SNIPPETS: Snippet[] = ALL_SNIPPETS.filter((s) => !s.hidden);

export function CodeCard() {
  const [tab, setTab] = useState<string>(SNIPPETS[0]?.id ?? 'script');
  const [copied, setCopied] = useState(false);
  const active = SNIPPETS.find((s) => s.id === tab) ?? SNIPPETS[0];

  function copy() {
    // Trailing display-only comments (e.g. "// 19 KB gzipped …") must NOT be
    // pasted into the user's site, so we filter `noCopy` lines first AND trim
    // trailing blank lines so the clipboard ends right after the closing tag.
    const copyable = active.lines.filter((l) => !l.noCopy);
    while (
      copyable.length &&
      copyable[copyable.length - 1].tokens.every(([, t]) => t.trim() === '')
    ) {
      copyable.pop();
    }
    const text = copyable.map((l) => l.tokens.map(([, t]) => t).join('')).join('\n');
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      /* clipboard blocked — no-op */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="border-border bg-background overflow-hidden rounded-xl border shadow-[0_1px_0_rgba(0,0,0,.02),0_4px_16px_rgba(0,0,0,.05)]">
      <div className="border-border bg-muted/40 flex items-end gap-0.5 border-b px-2 pt-1.5">
        {SNIPPETS.map((s) => {
          const isActive = s.id === tab;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setTab(s.id)}
              className={`relative top-px cursor-pointer rounded-t-md border border-b-0 px-3 py-2 font-mono text-[12px] transition-colors ${
                isActive
                  ? 'border-border bg-background text-foreground'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              }`}
            >
              {s.label}
            </button>
          );
        })}
        <div className="flex-1" />
        <button
          type="button"
          onClick={copy}
          className="text-muted-foreground hover:bg-muted hover:text-foreground mb-1 self-center rounded px-2 py-1 font-mono text-[11px] transition-colors"
        >
          {copied ? 'copied ✓' : 'copy'}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto px-3 py-3.5 font-mono text-[12px] leading-[1.65] sm:px-5 sm:py-4 sm:text-[13px]">
        {active.lines.map((line, i) => (
          <div key={i}>
            <span className="text-muted-foreground/60 inline-block w-7 pr-3.5 text-right select-none">
              {i + 1}
            </span>
            {line.tokens.length === 0 ? (
              <span>&nbsp;</span>
            ) : (
              line.tokens.map(([cls, txt], j) => (
                <span key={j} className={TOKEN_CLS[cls]}>
                  {txt}
                </span>
              ))
            )}
          </div>
        ))}
      </pre>
    </div>
  );
}
