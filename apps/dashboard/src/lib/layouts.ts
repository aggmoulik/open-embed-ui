import {
  Award,
  Clock,
  CreditCard,
  GalleryHorizontal,
  GitBranch,
  LayoutDashboard,
  LayoutGrid,
  List,
  Receipt,
  Star,
  TerminalSquare,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { WidgetLayout } from '@/types';

export interface LayoutMeta {
  value: WidgetLayout;
  label: string;
  icon: LucideIcon;
  /**
   * `featured: true` → visible to every user in the widget builder picker.
   * The 7 featured layouts are the production-ready set: grid/list for
   * browse, single-card for "latest", highlight for hero+supporting,
   * timeline for chronological, marquee for ticker rows, and masonry
   * for staggered pinboard. The other 5 stay admin-only — useful for
   * testing and power users without bloating the default picker.
   */
  featured: boolean;
}

/**
 * Single source of truth for widget layout metadata. Consumed by both
 * `/dashboard/widgets/page.tsx` (icon-only list view) and
 * `/dashboard/widgets/[id]/page.tsx` (full picker with labels + featured
 * gating). Keep this list in lockstep with `WidgetLayout` in
 * `@open-embed-ui/types` — TypeScript enforces it via the `value` type.
 */
export const LAYOUTS: readonly LayoutMeta[] = [
  { value: 'grid', label: 'Grid', icon: LayoutGrid, featured: true },
  { value: 'list', label: 'List', icon: List, featured: true },
  { value: 'timeline', label: 'Timeline', icon: Clock, featured: true },
  { value: 'single-card', label: 'Single Card', icon: CreditCard, featured: true },
  { value: 'marquee', label: 'Marquee', icon: GalleryHorizontal, featured: true },
  { value: 'masonry', label: 'Masonry', icon: LayoutDashboard, featured: true },
  { value: 'highlight', label: 'Highlight', icon: Star, featured: true },
  { value: 'terminal', label: 'Receipt', icon: Receipt, featured: false },
  { value: 'scorecard', label: 'Scorecard', icon: Trophy, featured: false },
  { value: 'gitlog', label: 'Git Log', icon: TerminalSquare, featured: false },
  { value: 'devlog', label: 'Dev Log', icon: GitBranch, featured: false },
  { value: 'proof', label: 'Proof of Work', icon: Award, featured: false },
];

/** Derived value → icon map, for callers that just need to render an icon. */
export const layoutIcons: Record<WidgetLayout, LucideIcon> = LAYOUTS.reduce(
  (acc, l) => {
    acc[l.value] = l.icon;
    return acc;
  },
  {} as Record<WidgetLayout, LucideIcon>,
);
