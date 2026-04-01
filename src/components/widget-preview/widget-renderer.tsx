import { GridLayout } from './grid-layout';
import { ListLayout } from './list-layout';
import { TimelineLayout } from './timeline-layout';
import { SingleCardLayout } from './single-card-layout';
import type { Contribution, WidgetConfig } from '@/types';

interface WidgetRendererProps {
  contributions: Contribution[];
  config: WidgetConfig;
}

export function WidgetRenderer({ contributions, config }: WidgetRendererProps) {
  const layout = config.layout ?? 'grid';
  const titleOverrides = config.titleOverrides;

  switch (layout) {
    case 'grid':
      return <GridLayout contributions={contributions} titleOverrides={titleOverrides} />;
    case 'list':
      return <ListLayout contributions={contributions} titleOverrides={titleOverrides} />;
    case 'timeline':
      return <TimelineLayout contributions={contributions} titleOverrides={titleOverrides} />;
    case 'single-card':
      return <SingleCardLayout contributions={contributions} titleOverrides={titleOverrides} />;
    default:
      return <GridLayout contributions={contributions} titleOverrides={titleOverrides} />;
  }
}
