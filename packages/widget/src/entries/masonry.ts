/**
 * Per-layout IIFE entry: only bundles MasonryLayout. Used by static-export
 * users who pick a layout at build time.
 */
import { bootWithLayout } from '../boot';
import { MasonryLayout } from '@open-embed-ui/widget-components';

bootWithLayout('masonry', MasonryLayout);
