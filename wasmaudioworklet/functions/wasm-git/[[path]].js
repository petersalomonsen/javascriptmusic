const WASM_GIT_UNPKG = 'https://unpkg.com/wasm-git@0.0.14/';

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const filePath = url.pathname.replace(/^\/wasm-git\//, '');
  const targetUrl = WASM_GIT_UNPKG + filePath;

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
