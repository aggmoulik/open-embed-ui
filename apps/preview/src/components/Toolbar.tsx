interface ToolbarProps {
  title: string;
  theme: string;
  viewport: string;
  onThemeChange: (t: string) => void;
  onViewportChange: (v: string) => void;
}

const themes = ['light', 'dark', 'system'] as const;
const viewports = [
  { value: 'desktop', label: 'Desktop' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'mobile', label: 'Mobile' },
] as const;

export function Toolbar({ title, theme, viewport, onThemeChange, onViewportChange }: ToolbarProps) {
  return (
    <div class="preview-toolbar">
      <h1>{title}</h1>

      <div class="toolbar-group">
        <span class="toolbar-label">Theme</span>
        {themes.map((t) => (
          <button
            key={t}
            class={`toolbar-btn ${theme === t ? 'active' : ''}`}
            onClick={() => onThemeChange(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div class="toolbar-group">
        <span class="toolbar-label">Viewport</span>
        {viewports.map((v) => (
          <button
            key={v.value}
            class={`toolbar-btn ${viewport === v.value ? 'active' : ''}`}
            onClick={() => onViewportChange(v.value)}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
