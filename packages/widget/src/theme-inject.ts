import { isValidOklch } from '@open-embed-ui/types';
import type { WidgetConfig } from '@open-embed-ui/types';

const STYLE_ATTR = 'data-geu-theme';

/**
 * Inject a `<style data-geu-theme>` block into the widget's Shadow DOM that
 * declares the per-widget theme tokens. Appended AFTER the bundled
 * `widget.css` so equal-specificity rules win the cascade.
 *
 * The widget does NOT know about presets — preset selection is purely a
 * dashboard naming concept. The dashboard resolves the chosen preset and
 * writes the full token map into `themeOverrides` before save. Anything
 * absent from `themeOverrides` falls through to the bundled widget.css
 * defaults.
 *
 * Idempotent: updates the existing style element in place rather than
 * appending duplicates. Safe to call from a useEffect that fires multiple
 * times (e.g. Next.js StrictMode double-invocation in dev).
 *
 * Defense in depth: drops any value that fails OKLCH validation, so a
 * hostile DB row or man-in-the-middle JSON tampering can't inject arbitrary
 * CSS rules. Invalid values fall through to whatever widget.css declared.
 */
export function applyThemeTokens(root: ShadowRoot, config: WidgetConfig) {
  const overrides = config.themeOverrides;
  const lightDecls = overrides?.light ? serializeDecls(overrides.light) : '';
  const darkDecls = overrides?.dark ? serializeDecls(overrides.dark) : '';

  // Nothing to inject — remove any prior style block so a previously themed
  // widget reverts to bundled defaults if the owner clears overrides.
  if (!lightDecls && !darkDecls) {
    const prior = root.querySelector(`style[${STYLE_ATTR}]`);
    prior?.remove();
    return;
  }

  const parts: string[] = [];
  if (lightDecls) parts.push(`.geu-widget{${lightDecls}}`);
  if (darkDecls) parts.push(`.geu-widget.dark{${darkDecls}}`);
  const css = parts.join('');

  let style = root.querySelector(`style[${STYLE_ATTR}]`) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.setAttribute(STYLE_ATTR, '');
    root.appendChild(style);
  }
  style.textContent = css;
}

function serializeDecls(map: Record<string, string>): string {
  return Object.entries(map)
    .filter(([, v]) => isValidOklch(v))
    .map(([k, v]) => `${k}:${v};`)
    .join('');
}
