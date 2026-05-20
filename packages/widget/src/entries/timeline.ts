/**
 * Per-layout IIFE entry: only bundles TimelineLayout. Used by static-export
 * users who pick a layout at build time.
 */
import { bootWithLayout } from '../boot';
import { TimelineLayout } from '@open-embed-ui/widget-components';

bootWithLayout('timeline', TimelineLayout);
