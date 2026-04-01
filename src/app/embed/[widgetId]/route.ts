import { db } from '@/db';
import { widgets, contributions, embeds } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { Contribution, WidgetConfig } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ widgetId: string }> }) {
  const { widgetId } = await params;
  const url = new URL(request.url);
  const themeParam = url.searchParams.get('theme'); // 'light' | 'dark' | null (system)

  const widget = await db.query.widgets.findFirst({
    where: and(eq(widgets.id, widgetId), eq(widgets.isPublic, true)),
  });

  if (!widget) {
    return new Response('Widget not found', { status: 404 });
  }

  const config: WidgetConfig = (widget.config as WidgetConfig) ?? {};

  let prs = await db
    .select()
    .from(contributions)
    .where(eq(contributions.userId, widget.userId))
    .orderBy(desc(contributions.mergedAt));

  if (config.timeRange && config.timeRange !== 'all') {
    const now = Date.now();
    const ranges = { week: 7, month: 30, year: 365 };
    const days = ranges[config.timeRange];
    const since = new Date(now - days * 24 * 60 * 60 * 1000);
    prs = prs.filter((c) => c.mergedAt && c.mergedAt >= since);
  }

  if (config.selectedPRs && config.selectedPRs.length > 0) {
    const selectedSet = new Set(config.selectedPRs);
    prs = prs.filter((c) => selectedSet.has(c.id));
  }

  if (config.maxItems) {
    prs = prs.slice(0, config.maxItems);
  }

  // Increment view count (fire and forget)
  incrementViewCount(widgetId);

  const layout = config.layout ?? 'grid';
  const titleOverrides = config.titleOverrides ?? {};
  const html = renderHTML(
    prs as Contribution[],
    layout,
    titleOverrides,
    widget.name,
    widgetId,
    themeParam,
  );

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

function renderHTML(
  prs: Contribution[],
  layout: string,
  titleOverrides: Record<string, string>,
  widgetName: string,
  widgetId: string,
  themeParam: string | null,
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  let content = '';

  if (prs.length === 0) {
    content = '<div class="empty">No contributions to display</div>';
  } else if (layout === 'grid') {
    content = `<div class="grid">${prs.map((pr) => prCard(pr, titleOverrides[pr.id])).join('')}</div>`;
  } else if (layout === 'list') {
    content = `<div class="list">${prs.map((pr) => prCard(pr, titleOverrides[pr.id], true)).join('')}</div>`;
  } else if (layout === 'timeline') {
    content = `<div class="timeline"><div class="tl-line"></div>${prs.map((pr) => timelineItem(pr, titleOverrides[pr.id])).join('')}</div>`;
  } else if (layout === 'single-card') {
    content = singleCard(prs[0], titleOverrides[prs[0].id]);
  } else {
    content = `<div class="grid">${prs.map((pr) => prCard(pr, titleOverrides[pr.id])).join('')}</div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(widgetName)}</title>
<style>${CSS}</style>
<script>
// Set initial theme class before paint to avoid flash
(function(){
  var forced = ${themeParam ? `'${themeParam}'` : 'null'};
  if(forced==='dark'){document.documentElement.classList.add('dark');}
  else if(forced==='light'){/* light is default, no class needed */}
  else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.classList.add('dark');}
})();
</script>
</head>
<body>
<div class="wrap">
${content}
<a href="${esc(baseUrl)}" target="_blank" rel="noopener noreferrer" class="footer">Powered by GitHub Embed UI</a>
</div>
<script>
(function(){
  function send(){var h=document.documentElement.scrollHeight;window.parent.postMessage({type:'geu-resize',widgetId:'${widgetId}',height:h},'*');}
  send();if(window.ResizeObserver){new ResizeObserver(send).observe(document.body);}

  // Listen for theme changes from parent (preview page)
  window.addEventListener('message',function(e){
    if(e.data&&e.data.type==='geu-theme'){
      var t=e.data.theme;
      document.documentElement.classList.remove('dark');
      if(t==='dark'){
        document.documentElement.classList.add('dark');
      } else if(t==='system'){
        if(window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches){
          document.documentElement.classList.add('dark');
        }
      }
      send();
    }
  });

  // Listen for OS theme changes (when in system mode)
  if(window.matchMedia){
    window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',function(e){
      // Only auto-switch if no forced theme (no class set by postMessage)
      if(!window._geuForcedTheme){
        document.documentElement.classList.toggle('dark',e.matches);
        send();
      }
    });
  }
})();
</script>
</body>
</html>`;
}

const PR_ICON =
  '<svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"/></svg>';
const PR_ICON_SM =
  '<svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354Z"/></svg>';

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
}

function prCard(pr: Contribution, titleOverride?: string, compact?: boolean) {
  const title = esc(titleOverride || pr.title);
  const avatar = `https://github.com/${esc(pr.repoOwner)}.png?size=32`;
  const date = pr.mergedAt
    ? `<time datetime="${new Date(pr.mergedAt).toISOString()}">${formatDate(pr.mergedAt)}</time>`
    : '';

  return `<div class="card">
  <span class="icon">${PR_ICON}</span>
  <div class="cnt">
    <a href="${esc(pr.url)}" target="_blank" rel="noopener noreferrer" class="title${compact ? ' sm' : ''}">${title}</a>
    <div class="meta">
      <a href="https://github.com/${esc(pr.repo)}" target="_blank" rel="noopener noreferrer" class="repo"><img src="${avatar}" alt="" class="av" loading="lazy">${esc(pr.repo)}</a>
      <span class="add">+${pr.additions}</span>
      <span class="del">-${pr.deletions}</span>
      ${date}
    </div>
  </div>
</div>`;
}

function timelineItem(pr: Contribution, titleOverride?: string) {
  const title = esc(titleOverride || pr.title);
  const avatar = `https://github.com/${esc(pr.repoOwner)}.png?size=32`;
  const date = pr.mergedAt
    ? `<time datetime="${new Date(pr.mergedAt).toISOString()}">${formatDate(pr.mergedAt)}</time>`
    : '';

  return `<div class="tl-item">
  <div class="tl-dot">${PR_ICON_SM}</div>
  <div class="cnt">
    <a href="${esc(pr.url)}" target="_blank" rel="noopener noreferrer" class="title">${title}</a>
    <div class="meta">
      <a href="https://github.com/${esc(pr.repo)}" target="_blank" rel="noopener noreferrer" class="repo"><img src="${avatar}" alt="" class="av" loading="lazy">${esc(pr.repo)}</a>
      <span class="add">+${pr.additions}</span>
      <span class="del">-${pr.deletions}</span>
      ${date}
    </div>
  </div>
</div>`;
}

function singleCard(pr: Contribution, titleOverride?: string) {
  const title = esc(titleOverride || pr.title);
  const avatar = `https://github.com/${esc(pr.repoOwner)}.png?size=48`;
  const dateStr = pr.mergedAt
    ? new Date(pr.mergedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return `<div class="single">
  <div class="s-icon">${PR_ICON}</div>
  <div class="cnt">
    <a href="${esc(pr.url)}" target="_blank" rel="noopener noreferrer" class="title lg">${title}</a>
    <div class="meta lg">
      <a href="https://github.com/${esc(pr.repo)}" target="_blank" rel="noopener noreferrer" class="repo"><img src="${avatar}" alt="" class="av lg" loading="lazy">${esc(pr.repo)}</a>
      <span class="add">+${pr.additions}</span>
      <span class="del">-${pr.deletions}</span>
      <span>${pr.changedFiles} files</span>
    </div>
    ${dateStr ? `<div class="date">Merged on <time datetime="${new Date(pr.mergedAt!).toISOString()}">${dateStr}</time></div>` : ''}
  </div>
</div>`;
}

async function incrementViewCount(widgetId: string) {
  try {
    const embed = await db.query.embeds.findFirst({ where: eq(embeds.widgetId, widgetId) });
    if (embed) {
      await db
        .update(embeds)
        .set({ viewCount: embed.viewCount + 1, updatedAt: new Date() })
        .where(eq(embeds.id, embed.id));
    }
  } catch {
    // Non-critical
  }
}

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:transparent;color:#1a1a2e;line-height:1.5;-webkit-font-smoothing:antialiased}
a{text-decoration:none;color:inherit}
a:hover{text-decoration:underline}
a.title{color:#1a1a2e}
a.repo{color:#71717a}
.wrap{padding:8px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
.list{display:flex;flex-direction:column;gap:6px}
.card{display:flex;gap:10px;padding:12px;border-radius:8px;border:1px solid #e4e4e7;background:#fff;transition:background .15s}
.card:hover{background:#fafafa}
.icon{flex-shrink:0;margin-top:2px;color:#9333ea}
.cnt{min-width:0;flex:1}
.title{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:13px;font-weight:500;color:#1a1a2e}
.title.sm{font-size:12px}
.title.lg{font-size:15px;font-weight:600;-webkit-line-clamp:2}
.meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:4px;font-size:11px;color:#71717a}
.meta.lg{font-size:13px;margin-top:6px}
.repo{display:flex;align-items:center;gap:4px;color:#71717a}
.av{width:14px;height:14px;border-radius:50%}
.av.lg{width:18px;height:18px}
.add{color:#16a34a}
.del{color:#dc2626}
.date{margin-top:4px;font-size:11px;color:#71717a}
.single{display:flex;gap:14px;padding:18px;border-radius:12px;border:1px solid #e4e4e7;background:#fff}
.s-icon{display:flex;align-items:center;justify-content:center;width:40px;height:40px;flex-shrink:0;border-radius:50%;background:rgba(147,51,234,.1);color:#9333ea}
.timeline{position:relative;padding-left:4px}
.tl-line{position:absolute;top:0;bottom:0;left:16px;width:1px;background:#e4e4e7}
.tl-item{position:relative;display:flex;gap:14px;padding:10px 0 10px 4px}
.tl-dot{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;width:26px;height:26px;flex-shrink:0;border-radius:50%;border:1px solid #e4e4e7;background:#fff;color:#9333ea}
.empty{text-align:center;padding:48px 16px;font-size:13px;color:#a1a1aa;border:1px dashed #e4e4e7;border-radius:8px}
.footer{display:block;text-align:center;margin-top:12px;font-size:10px;color:#a1a1aa}
.footer:hover{color:#71717a}
.dark body{color:#e4e4e7}
.dark .card,.dark .single{background:#18181b;border-color:#27272a}
.dark .card:hover{background:#1f1f23}
.dark a.title,.dark a.title.sm,.dark a.title.lg{color:#fafafa}
.dark .meta,.dark .date,.dark a.repo{color:#a1a1aa}
.dark .footer{color:#52525b}
.dark .footer:hover{color:#71717a}
.dark .empty{color:#71717a;border-color:#27272a}
.dark .tl-dot{background:#18181b;border-color:#27272a}
.dark .tl-line{background:#27272a}
.dark .s-icon{background:rgba(147,51,234,.15)}
`;
