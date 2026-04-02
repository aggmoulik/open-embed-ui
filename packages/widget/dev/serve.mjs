import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createConnection } from 'node:net';

const PORT = 3334;
const DEV_DIR = new URL('.', import.meta.url).pathname;
const DIST_DIR = join(DEV_DIR, '..', 'dist');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

function isPortInUse(port) {
  return new Promise((resolve) => {
    const conn = createConnection({ port }, () => {
      conn.end();
      resolve(true);
    });
    conn.on('error', () => resolve(false));
  });
}

async function start() {
  // Check if already running
  if (await isPortInUse(PORT)) {
    console.log(`\n  Widget preview already running on http://localhost:${PORT}\n`);
    process.exit(0);
  }

  // Check if widget is built
  const widgetPath = join(DIST_DIR, 'widget.js');
  if (!existsSync(widgetPath)) {
    console.error('\n  Error: widget.js not found. Run: pnpm build:widget\n');
    process.exit(1);
  }

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
    console.log(`\n  Widget Dev Preview: http://localhost:${PORT}`);
    console.log(`  Dashboard API must be running on http://localhost:3000\n`);
  });
}

start();
