/**
 * Per-layout IIFE entry: only bundles MarqueeLayout. Used by static-export
 * users who pick a layout at build time.
 */
import { bootWithLayout } from '../boot';
import { MarqueeLayout } from '@open-embed-ui/widget-components';

bootWithLayout('marquee', MarqueeLayout);
