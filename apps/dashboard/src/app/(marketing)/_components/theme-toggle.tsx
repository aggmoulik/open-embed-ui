'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

/**
 * Light ↔ dark toggle (no system option).
 *
 * If next-themes is resolving "system", we resolve it on first interaction
 * to whichever palette the OS currently prefers, then toggle from there.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  function toggle() {
    setTheme(isDark ? 'light' : 'dark');
  }

  const Icon = isDark ? Moon : Sun;
  const label = !mounted
    ? 'Toggle theme'
    : isDark
      ? 'Switch to light theme'
      : 'Switch to dark theme';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground inline-flex size-[30px] items-center justify-center rounded-md border transition-colors"
    >
      <Icon className="size-3.5" strokeWidth={1.75} />
    </button>
  );
}
