/**
 * pnpm export:widget — static export of a widget to a directory.
 *
 * Usage:
 *   pnpm export:widget --widget-id <id> --out <path> [--ignore-public] [--skip-build]
 *
 * Produces in <path>:
 *   - widget.js                  (copied from packages/widget/dist/)
 *   - widget-data.json           (the embed payload — same shape as /api/embed/[id])
 *   - .embed-manifest.json       (export metadata: timestamp, widget id, widget version)
 *
 * Requires env vars (loaded via `tsx --env-file`):
 *   - TURSO_DATABASE_URL
 *   - TURSO_AUTH_TOKEN (optional for local file:// URLs)
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const WIDGET_DIST = join(REPO_ROOT, 'packages', 'widget', 'dist');
const WIDGET_PKG_JSON = join(REPO_ROOT, 'packages', 'widget', 'package.json');
const WIDGET_SRC_DIR = join(REPO_ROOT, 'packages', 'widget', 'src');
const DB_PACKAGE_DIR = join(REPO_ROOT, 'packages', 'db');

import { getEmbedPayload } from '@github-embed-ui/db';

/**
 * Normalize file:./… URLs from packages/db/.env so they resolve relative to the
 * db package (matching how the dashboard's nested .env resolves them), not the
 * CWD of the script (the repo root).
 *
 * Safe to run before any DB call: the db client is a lazy Proxy that only
 * connects on first access, not at import time.
 */
function normalizeTursoUrl() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url || !url.startsWith('file:')) return;
  const path = url.slice('file:'.length);
  if (isAbsolute(path)) return;
  const resolved = resolve(DB_PACKAGE_DIR, path);
  process.env.TURSO_DATABASE_URL = `file:${resolved}`;
}

interface Args {
  widgetId: string;
  out: string;
  ignorePublic: boolean;
  skipBuild: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Partial<Args> = { ignorePublic: false, skipBuild: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--widget-id') args.widgetId = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--ignore-public') args.ignorePublic = true;
    else if (a === '--skip-build') args.skipBuild = true;
    else if (a === '--help' || a === '-h') {
      printHelp();
      process.exit(0);
    } else {
      console.error(`Unknown arg: ${a}`);
      printHelp();
      process.exit(1);
    }
  }
  if (!args.widgetId || !args.out) {
    printHelp();
    process.exit(1);
  }
  return args as Args;
}

function printHelp() {
  console.log(`
Usage:
  pnpm export:widget --widget-id <id> --out <path> [--ignore-public] [--skip-build]

Options:
  --widget-id <id>     Widget ID from the dashboard URL (required)
  --out <path>         Output directory — created if it doesn't exist (required)
  --ignore-public      Export even if the widget is marked private (default: false)
  --skip-build         Skip the widget rebuild check (default: rebuild if dist is stale)
  -h, --help           Show this help

Examples:
  pnpm export:widget --widget-id abc123 --out ../my-site/public/embeds/contributions
  pnpm export:widget --widget-id abc123 --out ./out --ignore-public
`);
}

function isWidgetDistStale(): boolean {
  const widgetJs = join(WIDGET_DIST, 'widget.js');
  if (!existsSync(widgetJs)) return true;
  const distMtime = statSync(widgetJs).mtimeMs;

  // If any source file is newer than dist/widget.js, it's stale.
  const walk = (dir: string): string[] => {
    const out: string[] = [];
    for (const entry of require('node:fs').readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walk(p));
      else out.push(p);
    }
    return out;
  };

  for (const file of walk(WIDGET_SRC_DIR)) {
    if (statSync(file).mtimeMs > distMtime) return true;
  }
  return false;
}

function buildWidgetIfNeeded(skipBuild: boolean) {
  if (skipBuild) {
    if (!existsSync(join(WIDGET_DIST, 'widget.js'))) {
      console.error(
        '✗ widget.js not found and --skip-build was set. Run `pnpm build:widget` first.',
      );
      process.exit(1);
    }
    console.log('  ↪ Skipping build (--skip-build).');
    return;
  }

  if (isWidgetDistStale()) {
    console.log('  ↻ Widget dist is stale — rebuilding…');
    execSync('pnpm build:widget', { cwd: REPO_ROOT, stdio: 'inherit' });
  } else {
    console.log('  ✓ Widget dist is up to date.');
  }
}

function getWidgetVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(WIDGET_PKG_JSON, 'utf-8'));
    return pkg.version ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = resolve(args.out);

  console.log(`\n→ Exporting widget ${args.widgetId} → ${outDir}\n`);

  if (!process.env.TURSO_DATABASE_URL) {
    console.error(
      '✗ TURSO_DATABASE_URL not set. Run via `pnpm export:widget` (the script auto-loads .env).',
    );
    process.exit(1);
  }
  normalizeTursoUrl();

  // 1. Build widget if needed
  buildWidgetIfNeeded(args.skipBuild);

  // 2. Fetch payload (same code path the API uses)
  console.log('  ↻ Fetching widget payload…');
  const result = await getEmbedPayload(args.widgetId, {
    ignorePublicFlag: args.ignorePublic,
  });

  if (!result) {
    console.error(
      `\n✗ Widget ${args.widgetId} not found or is marked private.\n` +
        '  Either set the widget to public in the dashboard, or use --ignore-public.\n',
    );
    process.exit(1);
  }

  // Static export ignores allowedOrigins — by definition, the owner
  // chose what to ship and where. The matcher only protects the live
  // API surface, not owner-controlled static files.
  const { payload } = result;

  console.log(
    `  ✓ Found widget "${payload.widget.name}" (${payload.contributions.length} contributions)`,
  );

  // 3. Prepare output dir
  mkdirSync(outDir, { recursive: true });

  // 4. Write widget-data.json
  const dataPath = join(outDir, 'widget-data.json');
  writeFileSync(dataPath, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
  console.log(`  ✓ Wrote ${relativeTo(outDir, dataPath)}`);

  // 5. Copy widget.js (and source map if present)
  const widgetJsSrc = join(WIDGET_DIST, 'widget.js');
  const widgetJsDest = join(outDir, 'widget.js');
  copyFileSync(widgetJsSrc, widgetJsDest);
  console.log(`  ✓ Copied widget.js`);

  const widgetMapSrc = join(WIDGET_DIST, 'widget.js.map');
  if (existsSync(widgetMapSrc)) {
    copyFileSync(widgetMapSrc, join(outDir, 'widget.js.map'));
    console.log(`  ✓ Copied widget.js.map`);
  }

  // 6. Write manifest
  const manifest = {
    exportedAt: new Date().toISOString(),
    widgetId: args.widgetId,
    widgetName: payload.widget.name,
    widgetVersion: getWidgetVersion(),
    contributionsCount: payload.contributions.length,
    layout: payload.widget.config.layout ?? 'grid',
  };
  writeFileSync(
    join(outDir, '.embed-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
    'utf-8',
  );
  console.log(`  ✓ Wrote .embed-manifest.json`);

  console.log(`
✓ Export complete.

  Files written to: ${outDir}
    - widget.js
    - widget-data.json
    - .embed-manifest.json

  Next steps for an Astro/static-site embed:
    <div id="my-contributions"></div>
    <script async
      src="/<your-public-path>/widget.js"
      data-src="/<your-public-path>/widget-data.json"
      data-mount="#my-contributions"
      data-theme="system"></script>
`);

  // Drizzle/libSQL keeps a connection open — exit explicitly so the script doesn't hang.
  process.exit(0);
}

function relativeTo(base: string, p: string): string {
  return p.startsWith(base) ? '.' + p.slice(base.length) : p;
}

main().catch((err) => {
  console.error('\n✗ Export failed:', err);
  process.exit(1);
});
