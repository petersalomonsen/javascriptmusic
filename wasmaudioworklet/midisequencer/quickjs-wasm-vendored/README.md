# Vendored quickjs-wasm

Copy of the [`quickjs-wasm`](https://www.npmjs.com/package/quickjs-wasm) npm
package (QuickJS compiled to WebAssembly, from
[quickjs-rust-near](https://github.com/petersalomonsen/quickjs-rust-near)),
used by `../quickjssandbox.js` to run song scripts in a sandbox.

Vendored rather than imported from `node_modules` because the deployed site
serves this directory tree as-is (no bundling of the main app, and
`node_modules` is not deployed). Keep in sync with the version in
`package.json` devDependencies:

    npm run sync-quickjs-wasm
