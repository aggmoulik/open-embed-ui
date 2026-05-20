/**
 * Widget build orchestrator.
 *
 * Vite library mode supports one entry per build, so we run Vite multiple
 * times to produce all 9 output bundles:
 *   - widget.js          (IIFE, all 12 layouts, dynamic-imports inlined)
 *   - widget-<layout>.js (IIFE × 7 production layouts)
 *   - index.mjs          (ESM with code-splitting, Preact external)
 *
 * Each build call layers a per-bundle `build` config on top of vite.config.ts
 * which provides the shared plugin chain (Tailwind v4, Preact, dts).
 */
import { build } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';

const PER_LAYOUT_ENTRIES = [
  'grid',
  'list',
  'timeline',
  'single-card',
  'marquee',
  'masonry',
  'highlight',
];

const sharedPlugins = () => [tailwindcss(), preact()];

const sharedResolve = { dedupe: ['preact'] };

/**
 * IIFE bundle config — used for widget.js (all-layouts) and per-layout
 * variants. inlineDynamicImports flattens the dynamic-import map so the
 * <script> tag user gets a single self-contained file.
 */
function iifeConfig({ entry, fileName }) {
  return {
    configFile: false,
    plugins: sharedPlugins(),
    resolve: sharedResolve,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry,
        name: 'GitHubEmbedWidget',
        formats: ['iife'],
        fileName: () => fileName,
      },
      rollupOptions: {
        output: { inlineDynamicImports: true },
      },
      minify: 'terser',
      terserOptions: {
        compress: { drop_console: true, drop_debugger: true },
        mangle: { reserved: ['GitHubEmbedWidget'] },
      },
      sourcemap: false,
      // Library mode would emit a separate widget.css. We want the CSS
      // embedded in the JS bundle (boot.ts imports it as ?inline) so the
      // <script> tag is self-sufficient — no separate CSS request.
      cssCodeSplit: false,
    },
  };
}

/**
 * ESM bundle config — npm consumers. Code-split chunks, Preact external,
 * sourcemap on, also emits the .d.ts via vite-plugin-dts.
 */
function esmConfig() {
  return {
    configFile: false,
    plugins: [
      ...sharedPlugins(),
      dts({
        outDir: 'dist',
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        rollupTypes: true,
        // Suppress the .d.ts emission for entries/ — those are IIFE-only.
        exclude: ['src/entries/**'],
      }),
    ],
    resolve: sharedResolve,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: 'src/index.ts',
        formats: ['es'],
        fileName: () => 'index.mjs',
      },
      rollupOptions: {
        external: ['preact', 'preact/hooks', 'preact/jsx-runtime'],
        output: {
          chunkFileNames: 'chunks/[name]-[hash].mjs',
        },
      },
      minify: 'terser',
      sourcemap: true,
      cssCodeSplit: false,
    },
  };
}

async function runAll() {
  console.log('  Building widget.js (all-layouts IIFE)...');
  await build(iifeConfig({ entry: 'src/index.ts', fileName: 'widget.js' }));

  for (const layout of PER_LAYOUT_ENTRIES) {
    console.log(`  Building widget-${layout}.js...`);
    await build(
      iifeConfig({
        entry: `src/entries/${layout}.ts`,
        fileName: `widget-${layout}.js`,
      }),
    );
  }

  console.log('  Building index.mjs (ESM + .d.ts)...');
  await build(esmConfig());
}

runAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
