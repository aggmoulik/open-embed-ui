#!/usr/bin/env node
/**
 * Bundle-size guard for the embeddable widget.
 *
 * Runs after `pnpm build:widget`. Fails (exit 1) if any tracked artifact
 * exceeds its gzipped budget — the widget ships on third-party sites,
 * so size regressions directly impact host-page TTI for everyone.
 *
 * Budgets are deliberately tight; growing them is a deliberate decision,
 * not a side-effect of an unrelated PR. Tune in BUDGETS below.
 */

import { readFileSync, statSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const WIDGET_DIST = join(REPO_ROOT, 'packages', 'widget', 'dist');
const CHUNKS_DIR = join(WIDGET_DIST, 'chunks');

// Gzipped byte budgets. Single source of truth — bump deliberately.
const BUDGETS = {
  // IIFE all-layouts bundle (default static-export ship + workers asset).
  // Raised 19→22 KB on 2026-05-20 (Stage 1 of shared-widget-components
  // migration) to accommodate Stage 2's ~2.5 KB preact/compat shim.
  // Raised 22→25 KB on 2026-05-20 (Stage 2 Task 11) — HighlightLayout's
  // useState plumbing + the shared PRCard's expanded helpers (safeHref/etc
  // from @open-embed-ui/types) added ~2 KB. Per-layout bundles all sit
  // comfortably under 22 KB; this ceiling only covers users who bundle all
  // 12 layouts at once via the script-tag path.
  'widget.js': 25 * 1024,
  // ESM core entry (consumed by per-layout per-bundle splits).
  'index.mjs': 11 * 1024,
  // ESM core shared chunk (Preact + theme bridge + mount + Widget).
  // Raised 12→14 KB on 2026-05-20 — Stage 2 T11/T12 added shared color
  // tokens to widget.css (oklch values for both light and dark modes,
  // mirroring packages/ui/src/styles/globals.css) so the Shadow DOM has
  // background/foreground/muted/border/brand/violet/danger CSS vars to
  // resolve; the chunk grew ~500 B.
  coreChunk: 14 * 1024,
  // Per-layout chunks. Most are < 1.5 KB; TerminalLayout acts as the
  // shared chunk for the receipt-family group after Rollup dedup, so
  // the ceiling is 3 KB to accommodate it.
  layoutChunk: 3 * 1024,
  // IIFE per-layout bundles (Task 5). Slim path for static-export users
  // who know their layout at build time. Each ships only the named layout
  // plus the shared core runtime.
  'widget-grid.js': 22 * 1024,
  'widget-list.js': 22 * 1024,
  'widget-timeline.js': 22 * 1024,
  'widget-single-card.js': 22 * 1024,
  'widget-marquee.js': 22 * 1024,
  'widget-masonry.js': 22 * 1024,
  'widget-highlight.js': 22 * 1024,
};

// Chunk names that count as "core" (shared runtime), not per-layout.
const CORE_CHUNKS = new Set(['index', 'labels', 'PRCard']);

const ERR = '\x1b[31m';
const OK = '\x1b[32m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function gzSize(path) {
  return gzipSync(readFileSync(path)).length;
}

function rawSize(path) {
  return statSync(path).size;
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function check(label, path, budget) {
  const raw = rawSize(path);
  const gz = gzSize(path);
  const overBudget = gz > budget;
  const pct = ((gz / budget) * 100).toFixed(0);
  const color = overBudget ? ERR : OK;
  const status = overBudget ? '✗ OVER' : '✓ OK';
  console.log(
    `  ${color}${status}${RESET}  ${label.padEnd(28)}  ${fmt(gz).padStart(8)} gz / ${fmt(budget)} budget  ${DIM}(${pct}% — raw ${fmt(raw)})${RESET}`,
  );
  return overBudget ? 1 : 0;
}

console.log('\n  Widget bundle-size guard\n  ────────────────────────\n');

let failures = 0;

// 1. Main IIFE bundle
failures += check('widget.js (IIFE)', join(WIDGET_DIST, 'widget.js'), BUDGETS['widget.js']);

// 2. ESM entry
failures += check('index.mjs (ESM)', join(WIDGET_DIST, 'index.mjs'), BUDGETS['index.mjs']);

// 3. Per-layout IIFE bundles (widget-grid.js, widget-list.js, etc.)
const PER_LAYOUT_BUNDLES = [
  'widget-grid.js',
  'widget-list.js',
  'widget-timeline.js',
  'widget-single-card.js',
  'widget-marquee.js',
  'widget-masonry.js',
  'widget-highlight.js',
];
console.log(`\n  ${DIM}Per-layout IIFE bundles:${RESET}`);
for (const name of PER_LAYOUT_BUNDLES) {
  failures += check(name, join(WIDGET_DIST, name), BUDGETS[name]);
}

// 3. Chunks — group by chunk name (files have content-hash suffixes).
const seenChunks = new Set();
const chunkFiles = readdirSync(CHUNKS_DIR).filter((f) => f.endsWith('.mjs') && !f.endsWith('.map'));

console.log(`\n  ${DIM}Shared core chunks:${RESET}`);
for (const f of chunkFiles.sort()) {
  const name = f.replace(/-[A-Za-z0-9_-]+\.mjs$/, '');
  if (!CORE_CHUNKS.has(name) || seenChunks.has(name)) continue;
  seenChunks.add(name);
  failures += check(name, join(CHUNKS_DIR, f), BUDGETS.coreChunk);
}

console.log(`\n  ${DIM}Per-layout chunks:${RESET}`);
for (const f of chunkFiles.sort()) {
  const name = f.replace(/-[A-Za-z0-9_-]+\.mjs$/, '');
  if (CORE_CHUNKS.has(name) || seenChunks.has(name)) continue;
  if (!name.endsWith('Layout')) continue;
  seenChunks.add(name);
  failures += check(name, join(CHUNKS_DIR, f), BUDGETS.layoutChunk);
}

console.log('');

if (failures > 0) {
  console.log(`  ${ERR}✗ ${failures} bundle(s) over budget. Fix or bump BUDGETS in scripts/check-bundle-size.mjs.${RESET}\n`);
  process.exit(1);
}

console.log(`  ${OK}✓ All bundles within budget.${RESET}\n`);
process.exit(0);
