/**
 * Dynamic-import map for the all-layouts IIFE bundle (widget.js).
 *
 * This module is intentionally NOT imported by Widget.tsx — it is passed in
 * as a prop by the all-layouts entry (src/index.ts) so that per-layout IIFE
 * entries (src/entries/*.ts) never pull this map into their bundle.
 */
import type { ComponentType } from 'preact';
import type { WidgetLayout, Contribution } from './types';

export interface LayoutProps {
  contributions: Contribution[];
  titleOverrides?: Record<string, string>;
}

export type LayoutResolver = (
  layout: WidgetLayout,
) => Promise<ComponentType<LayoutProps>>;

export const layoutResolver: LayoutResolver = async (layout) => {
  const importMap: Record<WidgetLayout, () => Promise<{ [key: string]: ComponentType<LayoutProps> }>> = {
    grid: () => import('@open-embed-ui/widget-components').then((m) => ({ GridLayout: m.GridLayout })),
    list: () => import('@open-embed-ui/widget-components').then((m) => ({ ListLayout: m.ListLayout })),
    timeline: () => import('@open-embed-ui/widget-components').then((m) => ({ TimelineLayout: m.TimelineLayout })),
    'single-card': () => import('@open-embed-ui/widget-components').then((m) => ({ SingleCardLayout: m.SingleCardLayout })),
    marquee: () => import('@open-embed-ui/widget-components').then((m) => ({ MarqueeLayout: m.MarqueeLayout })),
    masonry: () => import('@open-embed-ui/widget-components').then((m) => ({ MasonryLayout: m.MasonryLayout })),
    highlight: () => import('@open-embed-ui/widget-components').then((m) => ({ HighlightLayout: m.HighlightLayout })),
  };

  const exportNames: Record<WidgetLayout, string> = {
    grid: 'GridLayout',
    list: 'ListLayout',
    timeline: 'TimelineLayout',
    'single-card': 'SingleCardLayout',
    marquee: 'MarqueeLayout',
    masonry: 'MasonryLayout',
    highlight: 'HighlightLayout',
  };

  // Fall back to grid for any unknown / future layout string.
  const importer = importMap[layout] ?? importMap['grid'];
  const exportName = exportNames[layout] ?? exportNames['grid'];
  const mod = await importer();
  return mod[exportName] as ComponentType<LayoutProps>;
};

// Dropped layouts → closest surviving sibling.
export const LEGACY_LAYOUT_FALLBACK: Record<string, WidgetLayout> = {
  log: 'list',
};
