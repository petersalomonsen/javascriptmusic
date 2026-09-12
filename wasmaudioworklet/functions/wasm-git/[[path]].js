// jsDelivr, like every other runtime CDN dependency of the app: unpkg took
// production down once (2026-08-18) and a flaky fetch of lg2_opfs.js here
// stalls every test and every session that opens a repo.
const WASM_GIT_CDN = 'https://cdn.jsdelivr.net/npm/wasm-git@0.0.17/';

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const filePath = url.pathname.replace(/^\/wasm-git\//, '');
  const targetUrl = WASM_GIT_CDN + filePath;

  const resp = await fetch(targetUrl);
  const headers = new Headers();
  const ct = resp.headers.get('content-type');
  if (ct) headers.set('Content-Type', ct);
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

  return new Response(resp.body, {
    status: resp.status,
    headers,
  });
}
