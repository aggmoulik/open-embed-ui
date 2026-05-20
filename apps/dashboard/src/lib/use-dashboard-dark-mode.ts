'use client';

import { useEffect, useState } from 'react';

/** Subscribe to the dashboard's `<html class="dark">` toggle. Used by the
 *  widget preview to pick between light/dark token maps when the editor
 *  has no explicit preview-mode override. */
export function useDashboardDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const read = () => setIsDark(html.classList.contains('dark'));
    read();
    const observer = new MutationObserver(read);
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
