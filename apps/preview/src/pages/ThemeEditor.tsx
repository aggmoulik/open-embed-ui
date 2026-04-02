export function ThemeEditor() {
  return (
    <div class="preview-app">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '12px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Theme Editor</h1>
        <p style={{ color: '#9ca3af' }}>Coming soon — visual theme customization for your widgets.</p>
        <a href={window.location.pathname} style={{ color: '#7c3aed', fontSize: '14px' }}>
          Back to Preview
        </a>
      </div>
    </div>
  );
}
