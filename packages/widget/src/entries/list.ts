/**
 * Per-layout IIFE entry: only bundles ListLayout. Used by static-export
 * users who pick a layout at build time.
 */
import { bootWithLayout } from '../boot';
import { ListLayout } from '@open-embed-ui/widget-components';

bootWithLayout('list', ListLayout);
