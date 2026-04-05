import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const PORT = 8080;
const STATIC_ROOT = new URL('.', import.meta.url).pathname;
const WASM_GIT_UNPKG = 'https://unpkg.com/wasm-git@0.0.14/';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.glsl': 'text/plain',
  '.ts': 'text/plain',
  '.xml': 'text/xml',
  '.dsp': 'text/plain',
  '.txt': 'text/plain',
  '.map': 'application/json',
};

const CROSS_ORIGIN_HEADERS = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
};

async function handleWasmGitProxy(req, res) {
  const filePath = req.url.replace(/^\/wasm-git\//, '');
  const targetUrl = WASM_GIT_UNPKG + filePath;

  try {
    const fetchResp = await fetch(targetUrl);
    const ct = fetchResp.headers.get('content-type');
    res.writeHead(fetchResp.status, {
      'Content-Type': ct || 'application/octet-stream',
      ...CROSS_ORIGIN_HEADERS,
    });
    const body = Buffer.from(await fetchResp.arrayBuffer());
    res.end(body);
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('wasm-git proxy error: ' + err.message);
  }
}

async function handleStatic(req, res) {
  let urlPath = new URL(req.url, 'http://localhost').pathname;
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  const filePath = join(STATIC_ROOT, urlPath);

  if (!filePath.startsWith(STATIC_ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      res.writeHead(302, { Location: urlPath + '/' });
      res.end();
      return;
    }
    const data = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      ...CROSS_ORIGIN_HEADERS,
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}

const server = createServer((req, res) => {
  if (req.url.startsWith('/wasm-git/')) {
    handleWasmGitProxy(req, res);
  } else {
    handleStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}/`);
  console.log(`wasm-git proxy: /wasm-git/* -> unpkg.com`);
  console.log(`NEAR git: handled by service worker (/near-repo/*)`);
});
