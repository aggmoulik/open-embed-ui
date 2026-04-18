/**
 * Origin allowlist matcher — shared by the embed-api worker and the
 * dashboard's /api/embed route. Both must enforce identically; reuse
 * this function instead of re-implementing.
 *
 * Match rules:
 *   - Exact: "https://aggmoulik.github.io" matches that exact origin
 *     (scheme + host + port).
 *   - Wildcard subdomain: "*.aggmoulik.com" matches any subdomain on
 *     either http: or https:. Apex ("aggmoulik.com") is NOT included
 *     by the wildcard alone — list both if you want both.
 *   - "http://localhost:*" matches any localhost port (dev convenience).
 *
 * Out of scope:
 *   - Wildcards in the middle of a host ("foo.*.com") — rejected.
 *   - Path-level matching — origins are scheme + host + port only.
 *   - IP-address ranges, CIDR — not supported.
 *
 * Performance: O(allowlist.length). Allowlists are expected to be tiny
 * (1-10 entries). No regex caching needed.
 */

export interface ParsedOrigin {
  scheme: 'http:' | 'https:';
  hostname: string;
  port: string; // empty string when default port for scheme
}

/**
 * Parse a raw `Origin` header value. Returns null on malformed input,
 * non-http(s) schemes, or missing hostname.
 */
export function parseOrigin(header: string | null | undefined): ParsedOrigin | null {
  if (!header || typeof header !== 'string') return null;
  let url: URL;
  try {
    url = new URL(header);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (!url.hostname) return null;
  // URL strips trailing slashes from the origin; we ignore pathname/search/hash.
  return {
    scheme: url.protocol as 'http:' | 'https:',
    hostname: url.hostname.toLowerCase(),
    port: url.port, // '' when default
  };
}

/**
 * Normalize an allowlist entry into a structured matcher. Returns null
 * for entries that fail to parse — those are silently ignored at match
 * time (logged by the caller if desired). This means a single bad entry
 * can never crash the request path.
 *
 * Accepted forms:
 *   "https://example.com"        — exact origin
 *   "https://example.com:8080"   — exact origin with port
 *   "*.example.com"              — wildcard subdomain (any scheme http/https,
 *                                  any port; matches "a.example.com" but
 *                                  NOT bare "example.com")
 *   "http://localhost:*"         — any port on localhost over http
 */
type Matcher =
  | { kind: 'exact'; scheme: 'http:' | 'https:'; hostname: string; port: string }
  | { kind: 'wildcard-sub'; suffix: string } // suffix is "example.com" — must end with .suffix
  | { kind: 'localhost-any-port'; scheme: 'http:' | 'https:' };

function compileEntry(entry: string): Matcher | null {
  if (typeof entry !== 'string') return null;
  const trimmed = entry.trim().toLowerCase();
  if (!trimmed) return null;

  // Wildcard subdomain — "*.example.com"
  if (trimmed.startsWith('*.')) {
    const suffix = trimmed.slice(2);
    if (!suffix || suffix.includes('*') || suffix.includes('/') || suffix.includes(':')) {
      return null;
    }
    return { kind: 'wildcard-sub', suffix };
  }

  // localhost wildcard port — "http://localhost:*" or "https://localhost:*"
  const lhMatch = trimmed.match(/^(https?):\/\/localhost:\*$/);
  if (lhMatch) {
    return { kind: 'localhost-any-port', scheme: `${lhMatch[1]}:` as 'http:' | 'https:' };
  }

  // Exact origin
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (!url.hostname) return null;
  // Reject if there's any path beyond the origin
  if (url.pathname && url.pathname !== '/') return null;
  if (url.search || url.hash) return null;
  return {
    kind: 'exact',
    scheme: url.protocol as 'http:' | 'https:',
    hostname: url.hostname,
    port: url.port,
  };
}

/**
 * Returns true iff the parsed origin satisfies at least one allowlist
 * entry. An empty or missing allowlist returns true (back-compat: a
 * widget with no allowlist is unrestricted).
 *
 * Pass the parsed origin (or null when the request had no Origin header).
 */
export function matchesAllowlist(
  origin: ParsedOrigin | null,
  allowlist: string[] | null | undefined,
): boolean {
  // Unrestricted widget — always allowed
  if (!allowlist || allowlist.length === 0) return true;

  // Restricted widget but no Origin header on the request — block
  if (!origin) return false;

  for (const entry of allowlist) {
    const m = compileEntry(entry);
    if (!m) continue;

    if (m.kind === 'exact') {
      if (
        m.scheme === origin.scheme &&
        m.hostname === origin.hostname &&
        m.port === origin.port
      ) {
        return true;
      }
      continue;
    }

    if (m.kind === 'wildcard-sub') {
      // origin.hostname must end with `.suffix` AND have at least one label before
      const dotted = '.' + m.suffix;
      if (
        origin.hostname.endsWith(dotted) &&
        origin.hostname.length > dotted.length
      ) {
        return true;
      }
      continue;
    }

    if (m.kind === 'localhost-any-port') {
      if (origin.scheme === m.scheme && origin.hostname === 'localhost') {
        return true;
      }
      continue;
    }
  }

  return false;
}
