/**
 * Vite config — used by build.mjs only.
 *
 * The widget ships 9 output bundles (1 all-layouts IIFE + 7 per-layout IIFE
 * + 1 ESM). Vite library mode targets one entry per build, so build.mjs
 * calls vite.build() once per output with a different `build` config layered
 * on top of this base. The shared plugin chain (Tailwind v4 + Preact + dts)
 * lives here.
 */
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Tailwind v4 + Preact handle JSX (auto-aliases react → preact/compat,
  // react/jsx-runtime → preact/jsx-runtime). The shared widget-components
  // package's React-flavored source flows through the preact/compat shim.
  plugins: [tailwindcss(), preact()],
  resolve: {
    dedupe: ['preact'],
  },
});
