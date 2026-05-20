'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HexColorPicker, HexAlphaColorPicker } from 'react-colorful';
import { hexToOklch, oklchToHex } from '@/lib/oklch';

interface ColorRowProps {
  label: string;
  /** Current OKLCH literal — either from a preset default or an override. */
  value: string;
  /** Preset's default OKLCH for this token in the current mode. Used to
   *  decide whether the row is "overridden" (shows Reset link). */
  defaultValue: string;
  /** True when this token uses alpha (e.g. `--color-border` in dark mode). */
  withAlpha?: boolean;
  onChange: (oklch: string) => void;
  onReset: () => void;
}

// Estimated picker size — used to flip the popover when there isn't enough
// room below the trigger. The react-colorful picker is ~200x228 (alpha adds
// a 28px slider). With our 12px padding + 1px border, the box is ~226 × 254.
const POPOVER_W = 226;
const POPOVER_H_BASIC = 226;
const POPOVER_H_ALPHA = 254;
const GUTTER = 8;

export function ColorRow({
  label,
  value,
  defaultValue,
  withAlpha,
  onChange,
  onReset,
}: ColorRowProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const hex = oklchToHex(value);
  const isOverridden = value !== defaultValue;
  const Picker = withAlpha ? HexAlphaColorPicker : HexColorPicker;
  const popoverH = withAlpha ? POPOVER_H_ALPHA : POPOVER_H_BASIC;

  // Compute popover viewport position from the trigger's rect. Re-runs on
  // open, scroll, and resize so the popover follows the trigger.
  useLayoutEffect(() => {
    if (!open) return;
    const compute = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Default: open downward, right-aligned with the trigger.
      let top = rect.bottom + GUTTER;
      let left = rect.right - POPOVER_W;

      // Flip up if no room below
      if (top + popoverH > vh - GUTTER) {
        top = rect.top - popoverH - GUTTER;
      }
      // Clamp horizontally to the viewport
      if (left < GUTTER) left = GUTTER;
      if (left + POPOVER_W > vw - GUTTER) left = vw - POPOVER_W - GUTTER;
      // Clamp vertically (super-narrow viewports)
      if (top < GUTTER) top = GUTTER;

      setPos({ top, left });
    };
    compute();
    window.addEventListener('scroll', compute, true);
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute, true);
      window.removeEventListener('resize', compute);
    };
  }, [open, popoverH]);

  // Close on outside click. Mousedown-phase so click inside picker doesn't
  // close before its own onChange fires.
  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[12px]">{label}</div>
        <div className="text-muted-foreground/70 truncate font-mono text-[10px]">{value}</div>
      </div>

      <div className="flex items-center gap-2">
        {isOverridden && (
          <button
            type="button"
            onClick={onReset}
            className="text-muted-foreground/80 hover:text-foreground font-mono text-[10px] uppercase tracking-[0.06em]"
          >
            reset
          </button>
        )}

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="border-border size-7 rounded-md border shadow-inner"
          style={{ background: hex }}
          aria-label={`Pick color for ${label}`}
        />

        {open &&
          pos &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              ref={popoverRef}
              className="border-border bg-background fixed z-[60] rounded-lg border p-3 shadow-lg"
              style={{ top: pos.top, left: pos.left, width: POPOVER_W }}
            >
              <Picker color={hex} onChange={(newHex) => onChange(hexToOklch(newHex))} />
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
}
