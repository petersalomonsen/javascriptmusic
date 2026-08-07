import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

// PORT env override: lets a second checkout/worktree run its own server
// beside the default one on 8080.
const PORT = Number(process.env.PORT) || 8080;
const STATIC_ROOT = new URL('.', import.meta.url).pathname;
const WASM_GIT_UNPKG = 'https://unpkg.com/wasm-git@0.0.17/';

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
  '.md': 'text/markdown',
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

    // Mirror the production _headers exemption: any page that opens a WALLET
    // must not set COOP, otherwise the popup's window.opener gets neutered on
    // cross-origin navigation and Meteor's web wallet throws "User closed the
    // window". That is why login lives on its own page rather than inside the
    // app — the app itself needs COOP/COEP.
    const opensWallet = urlPath.startsWith('/login') || urlPath.startsWith('/pay');
    const headers = opensWallet
      ? { 'Content-Type': contentType }
      : { 'Content-Type': contentType, ...CROSS_ORIGIN_HEADERS };

    res.writeHead(200, headers);
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}

// --- Cloudflare Pages Functions, locally -----------------------------------
//
// In production `functions/<name>/[[path]].js` is executed by the Workers
// runtime. Without this, /nearai/* and /gitproxy/* simply 404 in dev, so a
// paywall living in the proxy would be invisible locally — the very thing you
// most want to try before deploying.
//
// The functions are plain ESM written against web APIs (Request, Response,
// crypto.subtle, fetch) that Node has natively, so running them is a matter of
// translating node req/res at the edges. `env` comes from process.env, which is
// how the real secrets (NEARAI_API_KEY, PASS_SECRET, X402_*) arrive in dev.
const FUNCTION_ROUTES = ['/nearai/', '/gitproxy/'];

async function handleFunction(req, res, routePrefix) {
  const name = routePrefix.replace(/\//g, '');
  const url = `http://localhost:${PORT}${req.url}`;

  const body = req.method === 'GET' || req.method === 'HEAD'
    ? undefined
    : await new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
      });

  try {
    const mod = await import(`./functions/${name}/[[path]].js`);
    const response = await mod.onRequest({
      request: new Request(url, { method: req.method, headers: req.headers, body }),
      env: process.env,
    });

    const headers = {};
    for (const [k, v] of response.headers) headers[k] = v;
    res.writeHead(response.status, headers);
    if (response.body) {
      // Stream it: chat completions can be long, and buffering would hide
      // streaming bugs that only show up in production.
      const reader = response.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
    }
    res.end();
  } catch (e) {
    console.error(`[function ${name}]`, e);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`function error: ${e.message}`);
  }
}

const server = createServer((req, res) => {
  const route = FUNCTION_ROUTES.find((p) => req.url.startsWith(p));
  if (route) {
    handleFunction(req, res, route);
  } else if (req.url.startsWith('/wasm-git/')) {
    handleWasmGitProxy(req, res);
  } else {
    handleStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}/`);
  console.log(`wasm-git proxy: /wasm-git/* -> unpkg.com`);
  console.log(`NEAR git: handled by service worker (/near-repo/*)`);
  console.log(`Pages Functions: ${FUNCTION_ROUTES.join(', ')} -> functions/*/[[path]].js`);
  const missing = ['NEARAI_API_KEY', 'PASS_SECRET'].filter((k) => !process.env[k]);
  if (missing.length) console.log(`  (unset: ${missing.join(', ')} — /nearai will 503 or refuse to mint passes)`);
});
