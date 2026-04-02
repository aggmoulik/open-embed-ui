import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const PORT = 3334;
const DEV_DIR = new URL('.', import.meta.url).pathname;
const DIST_DIR = join(DEV_DIR, '..', 'dist');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let filePath;

  if (url.pathname.startsWith('/dist/')) {
    filePath = join(DIST_DIR, url.pathname.replace('/dist/', ''));
  } else {
    filePath = join(DEV_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  }

  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
  res.end(readFileSync(filePath));
});

server.listen(PORT, () => {
  console.log(`\n  Widget Dev Preview: http://localhost:${PORT}\n`);
  console.log(`  Serves: dev/index.html + dist/widget.js`);
  console.log(`  Make sure dashboard is running: pnpm dev\n`);
});
