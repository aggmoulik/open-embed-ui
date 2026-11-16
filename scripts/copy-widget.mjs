/**
 * Copy the built widget bundle to a destination, creating parent dirs.
 * Cross-platform replacement for `mkdir -p ... && cp ...`.
 *
 * Usage: node scripts/copy-widget.mjs <destination>
 */
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = process.argv[2];

if (!destination) {
  console.error('Usage: node scripts/copy-widget.mjs <destination>');
  process.exit(1);
}

const source = resolve(repoRoot, 'packages/widget/dist/widget.js');
const target = resolve(repoRoot, destination);

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);

console.log(`Copied widget bundle to ${destination}`);
