# @open-embed-ui/widget

Embeddable widget that renders GitHub PR contributions inside a Shadow DOM. Drop a `<script>` tag on any page and a card/grid/timeline/etc. of your merged PRs renders inline.

- 📦 **Preact + Shadow DOM** — full style isolation from host page
- 🎨 **7 layouts**, lazy-loaded as needed
- 🌗 **Light / dark / system** theme
- 🛜 **Two data modes**: API-driven (live) or static JSON (zero backend)

---

## Installation modes

### Mode A — API-driven (live data)

Use this when the dashboard is deployed and you want widgets to always reflect the latest sync.

```html
<script
  async
  src="https://your-dashboard-domain/widget.js"
  data-widget-id="abc123"
  data-theme="system"
></script>
```

The widget fetches `https://your-dashboard-domain/api/embed/abc123` and renders.

| Attribute | Required | Description |
|---|---|---|
| `src` | yes | URL to `widget.js` (the dashboard origin) |
| `data-widget-id` | yes | Widget ID from the dashboard |
| `data-theme` | no | `light` \| `dark` \| `system` (default: `system`) |
| `data-mount` | no | CSS selector of an existing element to mount into. If omitted, a `<div>` is inserted next to the script tag. |

#### Origin allowlist (required)

Every widget must declare which sites are allowed to embed it. Default-deny: a widget with no configured origins returns 403 from everywhere. Configure in the dashboard's widget editor under "Allowed Origins". Examples:

```
https://aggmoulik.github.io
*.aggmoulik.com
http://localhost:*
```

Behavior:

| Allowlist | Result for browser embeds |
|---|---|
| (empty) | **Widget renders the placeholder *"This widget is not available on this site."* on every site (default deny).** The API returns 403 with no payload. |
| Set + origin matches | Widget renders normally |
| Set + origin mismatch | Widget renders the placeholder *"This widget is not available on this site."*; the API returns 403 with no payload |

Match rules:
- `https://exact.com` — exact origin (scheme + host + port)
- `*.example.com` — any subdomain of `example.com` (apex `example.com` is NOT included; list it explicitly if you want both)
- `http://localhost:*` — any port on localhost (dev convenience)

The allowlist protects the **live API surface only** — the static-export flow (Mode B) is owner-controlled and does not enforce origins.

---

### Mode B — Static (no backend)

Use this when you want to ship the widget on a static site (GitHub Pages, Netlify, Cloudflare Pages, an Astro SSG site) without deploying the dashboard. Export the widget data once locally with `pnpm export:widget`, then ship the JSON + widget bundle as static files.

```html
<div id="my-contributions"></div>
<script
  async
  src="/embeds/contributions/widget.js"
  data-src="/embeds/contributions/widget-data.json"
  data-mount="#my-contributions"
  data-theme="system"
></script>
```

| Attribute | Required | Description |
|---|---|---|
| `src` | yes | URL to `widget.js` (typically same-origin static asset) |
| `data-src` | yes | URL to a pre-exported `widget-data.json` (same JSON shape as the embed API) |
| `data-mount` | no | CSS selector to mount into. Recommended for static sites to control layout. |
| `data-theme` | no | `light` \| `dark` \| `system` (default: `system`) |

When `data-src` is present, `data-widget-id` and `baseUrl` are ignored.

---

## Programmatic API

For frameworks where you'd rather not use a script tag, import directly:

```ts
import { mount, unmount } from '@open-embed-ui/widget';

// Static mode
mount('#my-contributions', {
  dataSrc: '/embeds/contributions/widget-data.json',
  theme: 'system',
});

// API mode
mount('#my-contributions', {
  widgetId: 'abc123',
  baseUrl: 'https://your-dashboard-domain',
  theme: 'system',
});

// Cleanup
unmount('#my-contributions');
```

---

## Style isolation guarantees

The widget mounts entirely inside a Shadow DOM. It does **not**:

- Inject any `<link>`, `<style>`, `<script>`, or font tags into `document.head`
- Mutate `:root` CSS variables
- Add global event listeners outside of a `message` event for theme sync
- Override the host page's fonts, colors, or styles

The only light-DOM mutation is the mount container itself (the element you specify via `data-mount`, or a `<div>` inserted next to the script tag in back-compat mode).

---

## Theme sync from host page

The widget initially reads `prefers-color-scheme` (when `data-theme="system"`). To switch themes at runtime — for example, when your site has a light/dark toggle — post a message to the window:

```js
window.postMessage({ type: 'geu-theme', theme: 'dark' }, '*');
window.postMessage({ type: 'geu-theme', theme: 'light' }, '*');
window.postMessage({ type: 'geu-theme', theme: 'system' }, '*');
```

---

## Local development

```bash
pnpm install
pnpm build       # one-shot build to dist/
pnpm dev         # rollup watch mode
pnpm preview     # serve dev/index.html for testing
```

---

## Bundle size

| File | Gzipped |
|---|---|
| `widget.js` (entry) | ~17 KB |
| Each layout chunk | <1.5 KB (lazy-loaded) |

A page using one widget downloads the entry bundle plus exactly one layout chunk — never more.
