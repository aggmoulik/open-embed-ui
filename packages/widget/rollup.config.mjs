import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';

const shared = {
  input: 'src/index.ts',
  plugins: [
    postcss({
      inject: false,
      extract: false,
      minimize: true,
    }),
    resolve({
      browser: true,
      dedupe: ['preact'],
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationDir: undefined,
    }),
  ],
};

export default [
  // IIFE bundle for <script> tag (Preact bundled)
  {
    ...shared,
    output: {
      file: 'dist/widget.js',
      format: 'iife',
      name: 'GitHubEmbedWidget',
      sourcemap: false,
      inlineDynamicImports: true,
    },
    plugins: [
      ...shared.plugins,
      terser({
        compress: { drop_console: true, drop_debugger: true },
        mangle: { reserved: ['GitHubEmbedWidget'] },
      }),
    ],
  },
  // ESM bundle for npm (Preact as external)
  {
    ...shared,
    output: {
      dir: 'dist',
      entryFileNames: 'index.mjs',
      chunkFileNames: 'chunks/[name]-[hash].mjs',
      format: 'esm',
      sourcemap: true,
    },
    external: ['preact', 'preact/hooks', 'preact/jsx-runtime'],
    plugins: [
      ...shared.plugins,
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
      }),
    ],
  },
];
