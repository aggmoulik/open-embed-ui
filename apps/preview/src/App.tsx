import { Preview } from './pages/Preview';
import { ThemeEditor } from './pages/ThemeEditor';

export function App() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view') ?? 'preview';

  if (view === 'theme-editor') {
    return <ThemeEditor />;
  }

  return <Preview />;
}
