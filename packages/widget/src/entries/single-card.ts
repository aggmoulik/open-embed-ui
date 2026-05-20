/**
 * Per-layout IIFE entry: only bundles SingleCardLayout. Used by static-export
 * users who pick a layout at build time.
 */
import { bootWithLayout } from '../boot';
import { SingleCardLayout } from '@open-embed-ui/widget-components';

bootWithLayout('single-card', SingleCardLayout);
