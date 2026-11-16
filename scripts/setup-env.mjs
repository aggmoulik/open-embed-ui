/**
 * Create local env files from the checked-in examples without overwriting
 * existing files. Cross-platform replacement for `cp -n`.
 */
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const pairs = [
  ['packages/db/.env.example', 'packages/db/.env'],
  ['apps/dashboard/.env.example', 'apps/dashboard/.env'],
];

for (const [from, to] of pairs) {
  const source = resolve(repoRoot, from);
  const target = resolve(repoRoot, to);

  if (existsSync(target)) {
    console.log(`Skipped ${to} (already exists)`);
    continue;
  }

  copyFileSync(source, target);
  console.log(`Created ${to}`);
}
