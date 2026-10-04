#!/usr/bin/env node
// Local-only static server for the full portfolio and its campus demo.
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';

const ownDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = await realpath(path.resolve(ownDirectory, '../..'));
const portOption = process.argv.indexOf('--port');
const port = Number(portOption >= 0 ? process.argv[portOption + 1] : 8765);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('Invalid port. Usage: node server.mjs [--port 8765]');
  process.exit(1);
}
const host = '127.0.0.1';
const demoUrl = `http://${host}:${port}/demos/blueprint-campus/`;
const mimeTypes = new Map(Object.entries({
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.geojson': 'application/geo+json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.wasm': 'application/wasm',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.webmanifest': 'application/manifest+json',
}));

function isWithinRoot(candidate) {
  const relative = path.relative(projectRoot, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) &&
    relative !== '..' && !path.isAbsolute(relative));
}

function reply(req, res, status, message, extraHeaders = {}) {
  const bytes = Buffer.from(message);
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': bytes.byteLength,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  });
  res.end(req.method === 'HEAD' ? undefined : bytes);
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    reply(req, res, 405, 'Method not allowed.', { Allow: 'GET, HEAD' });
    return;
  }
  try {
    // Inspect the raw path before URL normalization could remove '..'.
    const rawPath = (req.url || '/').split('?')[0];
    if (!rawPath.startsWith('/')) {
      reply(req, res, 400, 'Invalid request path.');
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(rawPath);
    } catch {
      reply(req, res, 400, 'Invalid URL encoding.');
      return;
    }
    const segments = pathname.split('/').filter(Boolean);
    if (pathname.includes('\\') || pathname.includes('\0') || pathname.includes(':') ||
        segments.some(part => part === '..' || part === '.' || part.startsWith('.'))) {
      reply(req, res, 403, 'Path is not allowed.');
      return;
    }
    if (pathname === '/__blueprint_demo_health') {
      reply(req, res, 200, JSON.stringify({
        name: 'blueprint-campus-demo', root: projectRoot, pid: process.pid,
        url: demoUrl, port,
      }), { 'Content-Type': 'application/json; charset=utf-8' });
      return;
    }

    let target = path.resolve(projectRoot, ...segments);
    if (!isWithinRoot(target)) {
      reply(req, res, 403, 'Path is outside the project.');
      return;
    }
    target = await realpath(target);
    // Symlinks and Windows junctions cannot escape the project directory.
    if (!isWithinRoot(target) || path.relative(projectRoot, target).split(path.sep).some(s => s.startsWith('.'))) {
      reply(req, res, 403, 'Path is outside the public project files.');
      return;
    }
    let info = await stat(target);
    if (info.isDirectory()) {
      if (!rawPath.endsWith('/')) {
        reply(req, res, 308, 'Use the directory URL with a trailing slash.', {
          Location: `${rawPath}/${(req.url || '').includes('?') ? `?${req.url.split('?').slice(1).join('?')}` : ''}`,
        });
        return;
      }
      target = await realpath(path.join(target, 'index.html'));
      if (!isWithinRoot(target)) {
        reply(req, res, 403, 'Path is outside the project.');
        return;
      }
      info = await stat(target);
    }
    if (!info.isFile()) {
      reply(req, res, 404, 'File not found.');
      return;
    }
    res.writeHead(200, {
      'Content-Type': mimeTypes.get(path.extname(target).toLowerCase()) || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    const stream = createReadStream(target);
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  } catch (error) {
    if (['ENOENT', 'ENOTDIR', 'EACCES', 'EPERM'].includes(error.code)) {
      reply(req, res, error.code === 'EACCES' || error.code === 'EPERM' ? 403 : 404, 'File not found or inaccessible.');
      return;
    }
    console.error(error);
    if (!res.headersSent) reply(req, res, 500, 'Local server error.');
    else res.destroy();
  }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} is already occupied. Run Start-Demo.ps1 to reuse a running demo, or choose --port.`
    : error.message);
  process.exitCode = 1;
});
server.listen(port, host, () => {
  console.log(`Campus demo: ${demoUrl}`);
  console.log(`Project root: ${projectRoot}`);
  console.log(`PID: ${process.pid}; listening on localhost only.`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
