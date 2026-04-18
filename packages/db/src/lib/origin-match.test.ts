// Run with: node --test packages/db/src/lib/origin-match.test.mjs
//
// Zero-dep test suite using node:test. We import the .ts source via
// the project's tsx runner OR — simpler — duplicate the runtime module
// here as a .mjs companion. Since this package is pure TS without a
// build step, we use a tiny loader trick: the implementation is small
// enough to inline. To keep one source of truth, we import the .ts
// directly via tsx when invoked from `pnpm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseOrigin, matchesAllowlist } from './origin-match.ts';

test('parseOrigin', async (t) => {
  await t.test('valid http(s) origins', () => {
    assert.deepEqual(parseOrigin('https://aggmoulik.github.io'), {
      scheme: 'https:',
      hostname: 'aggmoulik.github.io',
      port: '',
    });
    assert.deepEqual(parseOrigin('http://localhost:3000'), {
      scheme: 'http:',
      hostname: 'localhost',
      port: '3000',
    });
  });

  await t.test('lowercases hostname', () => {
    assert.equal(parseOrigin('https://AGGMOULIK.github.io')?.hostname, 'aggmoulik.github.io');
  });

  await t.test('null/empty/garbage', () => {
    assert.equal(parseOrigin(null), null);
    assert.equal(parseOrigin(undefined), null);
    assert.equal(parseOrigin(''), null);
    assert.equal(parseOrigin('not a url'), null);
    assert.equal(parseOrigin('   '), null);
  });

  await t.test('rejects non-http(s) schemes', () => {
    assert.equal(parseOrigin('javascript:alert(1)'), null);
    assert.equal(parseOrigin('data:text/html,foo'), null);
    assert.equal(parseOrigin('file:///etc/passwd'), null);
    assert.equal(parseOrigin('ftp://example.com'), null);
  });

  await t.test('rejects type confusion', () => {
    assert.equal(parseOrigin(123), null);
    assert.equal(parseOrigin({}), null);
    assert.equal(parseOrigin([]), null);
  });
});

test('matchesAllowlist — back-compat (null/empty allowlist)', () => {
  const origin = parseOrigin('https://anywhere.com');
  assert.equal(matchesAllowlist(origin, null), true);
  assert.equal(matchesAllowlist(origin, undefined), true);
  assert.equal(matchesAllowlist(origin, []), true);
  // Even a missing Origin header is allowed when the widget is unrestricted
  assert.equal(matchesAllowlist(null, null), true);
});

test('matchesAllowlist — restricted but no Origin header → block', () => {
  assert.equal(matchesAllowlist(null, ['https://aggmoulik.github.io']), false);
});

test('matchesAllowlist — exact match', async (t) => {
  await t.test('matches identical origin', () => {
    const o = parseOrigin('https://aggmoulik.github.io');
    assert.equal(matchesAllowlist(o, ['https://aggmoulik.github.io']), true);
  });

  await t.test('rejects different scheme', () => {
    const o = parseOrigin('http://aggmoulik.github.io');
    assert.equal(matchesAllowlist(o, ['https://aggmoulik.github.io']), false);
  });

  await t.test('rejects different host', () => {
    const o = parseOrigin('https://attacker.com');
    assert.equal(matchesAllowlist(o, ['https://aggmoulik.github.io']), false);
  });

  await t.test('rejects different port', () => {
    const o = parseOrigin('https://example.com:8443');
    assert.equal(matchesAllowlist(o, ['https://example.com']), false);
  });

  await t.test('matches identical port', () => {
    const o = parseOrigin('http://localhost:4321');
    assert.equal(matchesAllowlist(o, ['http://localhost:4321']), true);
  });
});

test('matchesAllowlist — wildcard subdomain', async (t) => {
  const allow = ['*.aggmoulik.com'];

  await t.test('matches subdomain', () => {
    assert.equal(matchesAllowlist(parseOrigin('https://blog.aggmoulik.com'), allow), true);
    assert.equal(matchesAllowlist(parseOrigin('https://www.aggmoulik.com'), allow), true);
  });

  await t.test('matches deep subdomain', () => {
    assert.equal(matchesAllowlist(parseOrigin('https://a.b.aggmoulik.com'), allow), true);
  });

  await t.test('does NOT match apex', () => {
    assert.equal(matchesAllowlist(parseOrigin('https://aggmoulik.com'), allow), false);
  });

  await t.test('does NOT match suffix attack', () => {
    // 'evilaggmoulik.com' ends with 'aggmoulik.com' but not '.aggmoulik.com'
    assert.equal(matchesAllowlist(parseOrigin('https://evilaggmoulik.com'), allow), false);
    assert.equal(matchesAllowlist(parseOrigin('https://aggmoulik.com.attacker.io'), allow), false);
  });

  await t.test('matches both http and https', () => {
    assert.equal(matchesAllowlist(parseOrigin('http://blog.aggmoulik.com'), allow), true);
    assert.equal(matchesAllowlist(parseOrigin('https://blog.aggmoulik.com'), allow), true);
  });
});

test('matchesAllowlist — localhost any-port', async (t) => {
  const allow = ['http://localhost:*'];

  await t.test('matches any port', () => {
    assert.equal(matchesAllowlist(parseOrigin('http://localhost:3000'), allow), true);
    assert.equal(matchesAllowlist(parseOrigin('http://localhost:4321'), allow), true);
    assert.equal(matchesAllowlist(parseOrigin('http://localhost:5173'), allow), true);
    assert.equal(matchesAllowlist(parseOrigin('http://localhost'), allow), true);
  });

  await t.test('does NOT cross schemes', () => {
    assert.equal(matchesAllowlist(parseOrigin('https://localhost:3000'), ['http://localhost:*']), false);
  });

  await t.test('does NOT match 127.0.0.1', () => {
    // Tightly scoped — owner must add 127.0.0.1 explicitly if needed
    assert.equal(matchesAllowlist(parseOrigin('http://127.0.0.1:3000'), allow), false);
  });
});

test('matchesAllowlist — multiple entries (OR)', () => {
  const allow = ['https://aggmoulik.github.io', '*.aggmoulik.com', 'http://localhost:*'];
  assert.equal(matchesAllowlist(parseOrigin('https://aggmoulik.github.io'), allow), true);
  assert.equal(matchesAllowlist(parseOrigin('https://blog.aggmoulik.com'), allow), true);
  assert.equal(matchesAllowlist(parseOrigin('http://localhost:3000'), allow), true);
  assert.equal(matchesAllowlist(parseOrigin('https://attacker.com'), allow), false);
});

test('matchesAllowlist — adversarial entries are silently ignored', () => {
  const o = parseOrigin('https://aggmoulik.github.io');
  // None of these match anything, but they should not crash:
  const malformed = [
    'not a url',
    'javascript:alert(1)',
    'https://*.evil.*.com', // wildcard in middle, rejected
    '//no-scheme.com',
    'https://has-a-path.com/uh-oh',
    '',
    '   ',
  ];
  // With ONLY malformed entries (no valid match), result should be false (restricted widget)
  assert.equal(matchesAllowlist(o, malformed), false);

  // Mix one valid entry → still passes
  assert.equal(matchesAllowlist(o, [...malformed, 'https://aggmoulik.github.io']), true);
});
