import { db } from '@/db';
import { widgets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ widgetId: string }> },
) {
  const { widgetId } = await params;

  const widget = await db.query.widgets.findFirst({
    where: and(eq(widgets.id, widgetId), eq(widgets.isPublic, true)),
  });

  const widgetName = widget?.name ?? 'Widget';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const embedUrl = `${baseUrl}/embed/${widgetId}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(widgetName)} — Preview</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#f8fafc;--fg:#0f172a;--muted:#64748b;--border:#e2e8f0;--card-bg:#fff;--accent:#7c3aed}
.dark{--bg:#0f172a;--fg:#f1f5f9;--muted:#94a3b8;--border:#1e293b;--card-bg:#1e293b;--accent:#a78bfa}
body{
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  background:var(--bg);color:var(--fg);
  min-height:100vh;display:flex;flex-direction:column;align-items:center;
  transition:background .3s,color .3s;
}
.header{
  width:100%;max-width:900px;padding:24px 20px 0;
  display:flex;align-items:center;justify-content:space-between;
}
.header h1{font-size:18px;font-weight:600}
.theme-toggle{
  display:flex;gap:4px;padding:3px;border-radius:8px;
  background:var(--border);
}
.theme-toggle button{
  padding:6px 12px;border:none;border-radius:6px;cursor:pointer;
  font-size:12px;font-weight:500;background:transparent;color:var(--muted);
  transition:all .2s;
}
.theme-toggle button.active{background:var(--card-bg);color:var(--fg);box-shadow:0 1px 3px rgba(0,0,0,.1)}
.container{
  width:100%;max-width:900px;padding:20px;margin:20px auto;
}
.embed-frame{
  border-radius:12px;overflow:hidden;
  border:1px solid var(--border);
  background:var(--card-bg);
  box-shadow:0 4px 6px -1px rgba(0,0,0,.05);
}
.embed-frame iframe{
  width:100%;border:none;display:block;min-height:200px;
}
.info{
  text-align:center;margin-top:16px;
  font-size:12px;color:var(--muted);
}
.info a{color:var(--accent);text-decoration:none}
.info a:hover{text-decoration:underline}
.code-section{
  width:100%;max-width:900px;padding:0 20px 40px;
}
.code-section h2{font-size:14px;font-weight:600;margin-bottom:8px}
.code-block{
  background:var(--card-bg);border:1px solid var(--border);
  border-radius:8px;padding:14px;font-size:12px;
  font-family:'SF Mono',Monaco,Consolas,monospace;
  overflow-x:auto;word-break:break-all;white-space:pre-wrap;
  color:var(--fg);position:relative;
}
.copy-btn{
  position:absolute;top:8px;right:8px;
  padding:4px 10px;border-radius:6px;border:1px solid var(--border);
  background:var(--bg);color:var(--muted);cursor:pointer;
  font-size:11px;transition:all .2s;
}
.copy-btn:hover{color:var(--fg);border-color:var(--muted)}
</style>
</head>
<body>

<div class="header">
  <h1>${esc(widgetName)}</h1>
  <div class="theme-toggle">
    <button onclick="setTheme('light')" id="btn-light">Light</button>
    <button onclick="setTheme('dark')" id="btn-dark">Dark</button>
    <button onclick="setTheme('system')" id="btn-system" class="active">System</button>
  </div>
</div>

<div class="container">
  <div class="embed-frame">
    <iframe id="embed-iframe" src="${esc(embedUrl)}" loading="lazy"></iframe>
  </div>
  <p class="info">
    This is a live preview of your embedded widget.
    <a href="${esc(embedUrl)}" target="_blank">Open raw embed &rarr;</a>
  </p>
</div>

<div class="code-section">
  <h2>Embed Code</h2>
  <div class="code-block" id="code-block">
    <button class="copy-btn" onclick="copyCode()">Copy</button>
&lt;iframe src="${esc(embedUrl)}" width="100%" height="400" frameborder="0" style="border:none;border-radius:8px;"&gt;&lt;/iframe&gt;
  </div>
</div>

<script>
// Theme management
var currentTheme = 'system';

function setTheme(t) {
  currentTheme = t;
  document.getElementById('btn-light').className = t === 'light' ? 'active' : '';
  document.getElementById('btn-dark').className = t === 'dark' ? 'active' : '';
  document.getElementById('btn-system').className = t === 'system' ? 'active' : '';

  if (t === 'system') {
    var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.className = isDark ? 'dark' : '';
  } else {
    document.documentElement.className = t === 'dark' ? 'dark' : '';
  }

  // Send theme to embed iframe via postMessage (no reload)
  var iframe = document.getElementById('embed-iframe');
  iframe.contentWindow.postMessage({ type: 'geu-theme', theme: t }, '*');
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
  if (currentTheme === 'system') setTheme('system');
});

// Auto-resize iframe
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'geu-resize') {
    document.getElementById('embed-iframe').style.height = e.data.height + 'px';
  }
});

// Copy embed code
function copyCode() {
  var code = '<iframe src="${esc(embedUrl)}" width="100%" height="400" frameborder="0" style="border:none;border-radius:8px;"></iframe>';
  navigator.clipboard.writeText(code).then(function() {
    var btn = document.querySelector('.copy-btn');
    btn.textContent = 'Copied!';
    setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
  });
}

// Init
setTheme('system');
</script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
