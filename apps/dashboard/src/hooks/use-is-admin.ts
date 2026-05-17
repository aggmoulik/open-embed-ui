'use client';

import { useEffect, useState } from 'react';

interface MeResponse {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Fetches the current session's admin status from /api/me.
// Defaults to `false` so any gating using this hook is safe-by-default
// (regular-user view) until the response lands.
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/me')
      .then((res) => (res.ok ? (res.json() as Promise<MeResponse>) : null))
      .then((data) => {
        if (!cancelled && data) setIsAdmin(!!data.isAdmin);
      })
      .catch(() => {
        // Network error → stay in safe default (non-admin).
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return isAdmin;
}
