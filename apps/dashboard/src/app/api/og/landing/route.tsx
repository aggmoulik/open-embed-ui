import { ImageResponse } from 'next/og';

export const dynamic = 'force-dynamic';

const SWATCHES = [
  '#10b981',
  '#7c3aed',
  '#e11d48',
  '#f59e0b',
  '#06b6d4',
  '#ec4899',
  '#3b82f6',
  '#84cc16',
];

const ROWS = [
  { tag: 'feat', repo: 'vercel/next.js', title: 'Stream server actions through RSC', plus: 412, minus: 28 },
  { tag: 'fix', repo: 'facebook/react', title: 'Resolve hydration boundary mismatch', plus: 89, minus: 47 },
  { tag: 'docs', repo: 'vitejs/vite', title: 'Document SSR externals heuristic', plus: 36, minus: 8 },
];

const TAG_BG: Record<string, { bg: string; fg: string }> = {
  feat: { bg: 'rgba(16,185,129,0.16)', fg: '#34d399' },
  fix: { bg: 'rgba(244,63,94,0.16)', fg: '#fb7185' },
  docs: { bg: 'rgba(59,130,246,0.16)', fg: '#60a5fa' },
};

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#08080c',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Soft accent glow, top-left */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            left: '-180px',
            width: '700px',
            height: '700px',
            display: 'flex',
            background:
              'radial-gradient(circle at center, rgba(16,185,129,0.18) 0%, rgba(8,8,12,0) 60%)',
          }}
        />
        {/* Soft accent glow, bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: '-220px',
            right: '-180px',
            width: '700px',
            height: '700px',
            display: 'flex',
            background:
              'radial-gradient(circle at center, rgba(124,58,237,0.16) 0%, rgba(8,8,12,0) 60%)',
          }}
        />

        {/* LEFT — headline + meta */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 0 64px 72px',
            width: '640px',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  display: 'flex',
                }}
              />
              <span
                style={{
                  fontSize: '13px',
                  color: '#94a3b8',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                }}
              >
                open embed ui
              </span>
            </div>

            <span
              style={{
                fontSize: '68px',
                fontWeight: 700,
                color: '#f8fafc',
                letterSpacing: '-0.03em',
                lineHeight: 1.02,
                marginTop: '32px',
              }}
            >
              Show off your
            </span>
            <span
              style={{
                fontSize: '68px',
                fontWeight: 700,
                color: '#f8fafc',
                letterSpacing: '-0.03em',
                lineHeight: 1.02,
              }}
            >
              open-source PRs
            </span>
            <span
              style={{
                fontSize: '68px',
                fontWeight: 400,
                fontStyle: 'italic',
                color: '#e2e8f0',
                letterSpacing: '-0.03em',
                lineHeight: 1.02,
                fontFamily: 'Georgia, serif',
              }}
            >
              anywhere.
            </span>

            <span
              style={{
                fontSize: '22px',
                color: '#cbd5e1',
                marginTop: '28px',
                lineHeight: 1.4,
                maxWidth: '520px',
              }}
            >
              One &lt;script&gt; tag. Seven layouts. Themeable in any color.
            </span>
          </div>

          {/* Swatch row — no labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '14px' }}>
              {SWATCHES.map((color) => (
                <div
                  key={color}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: color,
                    border: '2px solid rgba(255,255,255,0.12)',
                    display: 'flex',
                  }}
                />
              ))}
            </div>
            <span
              style={{
                fontSize: '13px',
                color: '#64748b',
                fontFamily: 'monospace',
                letterSpacing: '0.04em',
              }}
            >
              shadow-dom isolated · 19 kb gzipped · zero iframes
            </span>
          </div>
        </div>

        {/* RIGHT — widget mockup card */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 72px 64px 32px',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '420px',
              background: '#0f0f15',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 24px 60px -20px rgba(0,0,0,0.6)',
            }}
          >
            {/* card header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#04110b',
                  fontSize: '18px',
                  fontWeight: 700,
                }}
              >
                A
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '15px', color: '#f8fafc', fontWeight: 600 }}>
                  @aggmoulik
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  127 merged PRs · 18 repos
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                height: '1px',
                background: 'rgba(255,255,255,0.08)',
                margin: '20px 0',
              }}
            />

            {/* PR rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ROWS.map((row) => {
                const tagColors = TAG_BG[row.tag];
                return (
                  <div key={row.repo} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: tagColors.bg,
                          color: tagColors.fg,
                          fontFamily: 'monospace',
                        }}
                      >
                        {row.tag}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                        {row.repo}
                      </span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: 1.3 }}>
                      {row.title}
                    </span>
                    <div style={{ display: 'flex', gap: '10px', fontFamily: 'monospace', fontSize: '11px' }}>
                      <span style={{ color: '#34d399' }}>+{row.plus}</span>
                      <span style={{ color: '#fb7185' }}>−{row.minus}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
