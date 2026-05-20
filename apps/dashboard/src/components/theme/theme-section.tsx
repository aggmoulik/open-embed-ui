'use client';

import type {
  ThemePresetId,
  ThemeTokenKey,
  ThemeOverrides,
  WidgetConfig,
} from '@open-embed-ui/types';
import { PRESETS } from '@open-embed-ui/widget-components';
import { Section, Field } from '../section';
import { ColorRow } from './color-row';

interface ThemeSectionProps {
  config: WidgetConfig;
  setConfig: (updater: (prev: WidgetConfig) => WidgetConfig) => void;
  /** Preview mode the editor wants to color-edit. The widget itself always
   *  follows the host page, but owners want to verify both modes here. */
  previewMode: 'light' | 'dark';
  setPreviewMode: (mode: 'light' | 'dark') => void;
}

const TOKEN_ORDER: ThemeTokenKey[] = [
  '--color-background',
  '--color-foreground',
  '--color-card',
  '--color-border',
  '--color-brand',
  '--color-muted',
];

const TOKEN_LABELS: Record<ThemeTokenKey, string> = {
  '--color-background': 'Background',
  '--color-foreground': 'Text',
  '--color-card': 'Card',
  '--color-border': 'Border',
  '--color-brand': 'Brand accent',
  '--color-muted': 'Muted surface',
};

// `--color-border` in the default dark preset uses 10% alpha. Expose the
// alpha picker for this token only — other tokens stay opaque to prevent
// owners accidentally making text or backgrounds transparent.
const TOKENS_WITH_ALPHA = new Set<ThemeTokenKey>(['--color-border']);

/**
 * Returns the full active token map for the given mode by reading from
 * themeOverrides first and filling any missing keys from the preset. The
 * dashboard always writes a complete map on preset pick, but legacy widgets
 * may have sparse overrides — this keeps the UI rendering sensibly until
 * the next save flushes a complete map.
 */
function getActiveTokens(
  preset: ThemePresetId,
  overrides: ThemeOverrides | undefined,
  mode: 'light' | 'dark',
): Record<ThemeTokenKey, string> {
  const presetTokens = PRESETS[preset][mode];
  return { ...presetTokens, ...(overrides?.[mode] ?? {}) };
}

export function ThemeSection({
  config,
  setConfig,
  previewMode,
  setPreviewMode,
}: ThemeSectionProps) {
  const presetId = config.preset ?? 'default';
  const activeTokens = getActiveTokens(presetId, config.themeOverrides, previewMode);
  const presetTokens = PRESETS[presetId][previewMode];
  const hasOverrides = Boolean(config.themeOverrides);

  return (
    <Section title="theme">
      <Field label="Preset">
        <select
          value={presetId}
          onChange={(e) => {
            const next = e.target.value as ThemePresetId;
            setConfig((prev) => applyPreset(prev, next));
          }}
          className="border-border bg-background text-foreground focus:border-foreground focus:ring-brand/25 h-9 w-full rounded-md border px-2.5 font-mono text-[12px] focus:outline-none focus:ring-2"
        >
          {Object.values(PRESETS).map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="mb-3 mt-4 flex gap-1.5">
        <ModeTab
          active={previewMode === 'light'}
          onClick={() => setPreviewMode('light')}
          label="☀ Light"
        />
        <ModeTab
          active={previewMode === 'dark'}
          onClick={() => setPreviewMode('dark')}
          label="☾ Dark"
        />
      </div>

      <div className="border-border divide-border divide-y divide-dashed border-t border-dashed">
        {TOKEN_ORDER.map((key) => (
          <ColorRow
            key={`${previewMode}-${key}`}
            label={TOKEN_LABELS[key]}
            value={activeTokens[key]}
            defaultValue={presetTokens[key]}
            withAlpha={TOKENS_WITH_ALPHA.has(key)}
            onChange={(oklch) =>
              setConfig((prev) => setTokenValue(prev, previewMode, key, oklch))
            }
            onReset={() =>
              setConfig((prev) => setTokenValue(prev, previewMode, key, presetTokens[key]))
            }
          />
        ))}
      </div>

      {hasOverrides && (
        <button
          type="button"
          onClick={() => setConfig((prev) => ({ ...prev, themeOverrides: undefined }))}
          className="text-muted-foreground/80 hover:text-foreground mt-3 font-mono text-[11px] uppercase tracking-[0.06em]"
        >
          ✕ Reset all overrides
        </button>
      )}
    </Section>
  );
}

function ModeTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md border px-2 py-1.5 font-mono text-[11px] transition-colors ${
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Apply a preset choice. Writes the full light + dark token maps into
 * themeOverrides so the widget runtime (which knows nothing about presets)
 * has complete data. Discards any prior per-token customizations — same as
 * any design tool: re-picking a preset is a clean reset to that preset.
 */
function applyPreset(config: WidgetConfig, presetId: ThemePresetId): WidgetConfig {
  const preset = PRESETS[presetId];
  return {
    ...config,
    preset: presetId,
    themeOverrides: {
      light: { ...preset.light },
      dark: { ...preset.dark },
    },
  };
}

/**
 * Update a single token in themeOverrides. Ensures the override map is
 * fully populated for the edited mode (preset baseline + user changes), so
 * the widget always receives complete data.
 */
function setTokenValue(
  config: WidgetConfig,
  mode: 'light' | 'dark',
  key: ThemeTokenKey,
  value: string,
): WidgetConfig {
  const presetId = config.preset ?? 'default';
  const preset = PRESETS[presetId];
  const existing = config.themeOverrides ?? {};
  const modeMap = existing[mode] ?? preset[mode];
  const next: ThemeOverrides = {
    light: { ...preset.light, ...(existing.light ?? {}) },
    dark: { ...preset.dark, ...(existing.dark ?? {}) },
  };
  next[mode] = { ...modeMap, [key]: value };
  return { ...config, themeOverrides: next };
}
