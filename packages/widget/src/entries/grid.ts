/**
 * Per-layout IIFE entry: only bundles GridLayout. Used by static-export
 * users who pick a layout at build time.
 */
import { bootWithLayout } from '../boot';
import { GridLayout } from '@open-embed-ui/widget-components';

bootWithLayout('grid', GridLayout);
