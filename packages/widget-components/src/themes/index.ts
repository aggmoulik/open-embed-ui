// Re-export from @open-embed-ui/types so the dashboard's existing
// `import { PRESETS, resolveThemeTokens } from '@open-embed-ui/widget-components'`
// keeps working, while the actual data + helper live in `types` (no React
// deps) so server-side code (embed payload normalization in @open-embed-ui/db)
// can also use it without pulling React/Preact in.
export { PRESETS, resolveThemeTokens } from '@open-embed-ui/types';
export type { ThemePreset } from '@open-embed-ui/types';
