import type { ThemePresetId, ThemeTokenKey, ThemeOverrides } from './index';

type TokenMap = Record<ThemeTokenKey, string>;

export interface ThemePreset {
  id: ThemePresetId;
  label: string;
  light: TokenMap;
  dark: TokenMap;
}

export const PRESETS: Record<ThemePresetId, ThemePreset> = {
  default: {
    id: 'default',
    label: 'Default (Emerald)',
    light: {
      '--color-background': 'oklch(1 0 0)',
      '--color-foreground': 'oklch(0.145 0 0)',
      '--color-card': 'oklch(1 0 0)',
      '--color-border': 'oklch(0.922 0 0)',
      '--color-brand': 'oklch(0.629 0.149 159.6)',
      '--color-muted': 'oklch(0.97 0 0)',
    },
    dark: {
      '--color-background': 'oklch(0.145 0 0)',
      '--color-foreground': 'oklch(0.985 0 0)',
      '--color-card': 'oklch(0.205 0 0)',
      '--color-border': 'oklch(1 0 0 / 10%)',
      '--color-brand': 'oklch(0.69 0.155 159.6)',
      '--color-muted': 'oklch(0.269 0 0)',
    },
  },
  neutral: {
    id: 'neutral',
    label: 'Neutral',
    light: {
      '--color-background': 'oklch(1 0 0)',
      '--color-foreground': 'oklch(0.145 0 0)',
      '--color-card': 'oklch(0.985 0 0)',
      '--color-border': 'oklch(0.92 0 0)',
      '--color-brand': 'oklch(0.205 0 0)',
      '--color-muted': 'oklch(0.97 0 0)',
    },
    dark: {
      '--color-background': 'oklch(0.145 0 0)',
      '--color-foreground': 'oklch(0.985 0 0)',
      '--color-card': 'oklch(0.205 0 0)',
      '--color-border': 'oklch(1 0 0 / 12%)',
      '--color-brand': 'oklch(0.985 0 0)',
      '--color-muted': 'oklch(0.269 0 0)',
    },
  },
  violet: {
    id: 'violet',
    label: 'Violet',
    light: {
      '--color-background': 'oklch(1 0 0)',
      '--color-foreground': 'oklch(0.145 0 0)',
      '--color-card': 'oklch(1 0 0)',
      '--color-border': 'oklch(0.92 0.015 285)',
      '--color-brand': 'oklch(0.481 0.226 285)',
      '--color-muted': 'oklch(0.97 0.01 285)',
    },
    dark: {
      '--color-background': 'oklch(0.145 0 0)',
      '--color-foreground': 'oklch(0.985 0 0)',
      '--color-card': 'oklch(0.205 0 0)',
      '--color-border': 'oklch(0.92 0.04 285 / 12%)',
      '--color-brand': 'oklch(0.62 0.21 285)',
      '--color-muted': 'oklch(0.269 0.02 285)',
    },
  },
  rose: {
    id: 'rose',
    label: 'Rose',
    light: {
      '--color-background': 'oklch(1 0 0)',
      '--color-foreground': 'oklch(0.145 0 0)',
      '--color-card': 'oklch(1 0 0)',
      '--color-border': 'oklch(0.92 0.018 15)',
      '--color-brand': 'oklch(0.595 0.205 15)',
      '--color-muted': 'oklch(0.97 0.012 15)',
    },
    dark: {
      '--color-background': 'oklch(0.145 0 0)',
      '--color-foreground': 'oklch(0.985 0 0)',
      '--color-card': 'oklch(0.205 0 0)',
      '--color-border': 'oklch(0.92 0.04 15 / 12%)',
      '--color-brand': 'oklch(0.69 0.195 15)',
      '--color-muted': 'oklch(0.269 0.02 15)',
    },
  },
  mono: {
    id: 'mono',
    label: 'Mono (High Contrast)',
    light: {
      '--color-background': 'oklch(1 0 0)',
      '--color-foreground': 'oklch(0 0 0)',
      '--color-card': 'oklch(1 0 0)',
      '--color-border': 'oklch(0 0 0)',
      '--color-brand': 'oklch(0 0 0)',
      '--color-muted': 'oklch(0.95 0 0)',
    },
    dark: {
      '--color-background': 'oklch(0 0 0)',
      '--color-foreground': 'oklch(1 0 0)',
      '--color-card': 'oklch(0 0 0)',
      '--color-border': 'oklch(1 0 0)',
      '--color-brand': 'oklch(1 0 0)',
      '--color-muted': 'oklch(0.18 0 0)',
    },
  },
};

/** Merge sparse user overrides onto the chosen preset. Unknown preset IDs
 *  silently fall back to `default` so future preset renames/removals don't
 *  break the widget. */
export function resolveThemeTokens(
  presetId: ThemePresetId | undefined,
  overrides: ThemeOverrides | undefined,
): { light: TokenMap; dark: TokenMap } {
  const preset = PRESETS[presetId ?? 'default'] ?? PRESETS.default;
  return {
    light: { ...preset.light, ...(overrides?.light ?? {}) },
    dark: { ...preset.dark, ...(overrides?.dark ?? {}) },
  };
}
