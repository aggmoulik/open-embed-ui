'use client';

import { ReactNode } from 'react';

interface WaitlistTriggerProps {
  className?: string;
  children: ReactNode;
}

/**
 * Client-side anchor that scrolls the hero waitlist input into view AND
 * focuses it. The hero's `<InlineWaitlist>` renders `<input id="waitlist-email">`
 * as the single source of truth for this anchor target.
 *
 * Falls back to a hash-only nav if the input isn't on the page (e.g. when
 * the user is signed-in and the hero shows the "Open dashboard" card instead).
 */
export function WaitlistTrigger({ className, children }: WaitlistTriggerProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const target = typeof document !== 'undefined'
      ? document.getElementById('waitlist-email')
      : null;
    if (!target) return; // let the browser fall back to anchor nav
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Wait for the smooth-scroll to settle before focusing — focusing
    // mid-scroll on iOS Safari cancels the scroll.
    window.setTimeout(() => {
      target.focus({ preventScroll: true });
    }, 420);
  }

  return (
    <a href="#waitlist-email" onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
