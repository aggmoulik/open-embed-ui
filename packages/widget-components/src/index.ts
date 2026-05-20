/**
 * Shared widget components — consumed by:
 *   - apps/dashboard (React 19, native)
 *   - packages/widget (Preact 10, via preact/compat alias at build time)
 *
 * Components written as React JSX with Tailwind utility classes inline.
 * Both consumers' Tailwind builds scan this package's source for class names.
 *
 * Constraints: no React-only deps (lucide-react, radix-ui, shadcn primitives,
 * next/* imports). Inline SVG icons live in ./icons.tsx.
 *
 * See docs/superpowers/specs/2026-05-19-shared-widget-components-design.md
 */

export * from './icons';
export * from './PRCard';
export * from './layouts/GridLayout';
export * from './layouts/ListLayout';
export * from './layouts/MasonryLayout';
export * from './layouts/MarqueeLayout';
export * from './layouts/SingleCardLayout';
export * from './layouts/HighlightLayout';
export * from './layouts/TimelineLayout';

// More layouts added in subsequent tasks.
