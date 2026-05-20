/**
 * Per-layout IIFE entry: only bundles HighlightLayout. Used by static-export
 * users who pick a layout at build time.
 */
import { bootWithLayout } from '../boot';
import { HighlightLayout } from '@open-embed-ui/widget-components';

bootWithLayout('highlight', HighlightLayout);
