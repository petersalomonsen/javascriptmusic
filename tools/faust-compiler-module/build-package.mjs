#!/usr/bin/env node
// build-package.mjs — assemble the `@psalomo/wasm-music-faust` npm package
// around a freshly built compiler module.
//
//   node tools/faust-compiler-module/build-package.mjs \
//     --module <libfaust-rs.wasm> --license <faust-rs/LICENSE> \
//     --out <dir> --version 0.1.0 \
//     [--faust-rs-commit <sha>] [--faustlibraries-commit <sha>]
//
// The package carries exactly what this project consumes — the compiler module
// — plus the license it inherits and the provenance of the build. The app never
// touches a JS API from it: the browser does a bare
// `WebAssembly.instantiate(bytes, {})` and tools/faust2as/faust2asc.js reads the
// .wasm off disk, so a wrapper would be dead weight (the fork this replaced
// shipped ~19 MB to deliver one 10 MB file).
//
// Licensing: the module is the faust-rs compiler compiled to wasm32, so it is
// GRAME's code under LGPL-2.1-or-later, not ours. `--license` must point at the
// LICENSE of the faust-rs checkout it was built from, so the text always
// matches the source revision.

import fs from 'fs';
import path from 'path';

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i += 2) {
        if (!argv[i].startsWith('--')) throw new Error(`Unexpected argument: ${argv[i]}`);
        args[argv[i].slice(2)] = argv[i + 1];
    }
    return args;
}

const args = parseArgs(process.argv.slice(2));
const required = ['module', 'license', 'out', 'version'];
const missing = required.filter(name => !args[name]);
if (missing.length > 0) {
    console.error(`Missing required argument(s): ${missing.map(m => `--${m}`).join(', ')}`);
    console.error('Usage: build-package.mjs --module <wasm> --license <LICENSE> --out <dir> --version <semver>');
    process.exit(2);
}

const PACKAGE_NAME = '@psalomo/wasm-music-faust';
const MODULE_FILE = 'faust-compiler-module.wasm';
const REPO_URL = 'https://github.com/petersalomonsen/javascriptmusic';

if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(args.version)) {
    console.error(`--version ${args.version} is not a semver version`);
    process.exit(1);
}

const moduleBytes = fs.readFileSync(args.module);
if (!(moduleBytes.length > 4 && moduleBytes[0] === 0x00 && moduleBytes[1] === 0x61
    && moduleBytes[2] === 0x73 && moduleBytes[3] === 0x6d)) {
    console.error(`${args.module} does not start with the \\0asm magic`);
    process.exit(1);
}

// The module knows its own ABI version — record it rather than tracking it by
// hand, so every published version says which compiler it carries.
const { instance } = await WebAssembly.instantiate(moduleBytes, {});
const e = instance.exports;
const moduleVersion = new TextDecoder().decode(
    new Uint8Array(e.memory.buffer).slice(
        e.faust_wasm_version_ptr(),
        e.faust_wasm_version_ptr() + e.faust_wasm_version_len()
    )
);

const outDir = path.resolve(args.out);
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const packageJson = {
    name: PACKAGE_NAME,
    version: args.version,
    description:
        'The Faust compiler (faust-rs) built for wasm32-unknown-unknown with the '
        + 'AssemblyScript backend and the Faust standard libraries embedded — the '
        + 'compiler module loaded by WebAssembly Music.',
    license: 'LGPL-2.1-or-later',
    author: 'Peter Salomonsen <contact@petersalomonsen.com>',
    repository: {
        type: 'git',
        url: `git+${REPO_URL}.git`,
    },
    homepage: `${REPO_URL}/tree/master/tools/faust-compiler-module#readme`,
    bugs: { url: `${REPO_URL}/issues` },
    keywords: ['faust', 'faust-rs', 'webassembly', 'assemblyscript', 'audio', 'dsp', 'compiler'],
    type: 'module',
    files: [MODULE_FILE, 'README.md', 'LICENSE'],
    exports: {
        [`./${MODULE_FILE}`]: `./${MODULE_FILE}`,
        './package.json': './package.json',
    },
    // Provenance of this specific build, for anyone asking "which compiler is
    // this, and which standard library is baked into it?".
    faustRs: {
        compilerModule: moduleVersion,
        faustRsCommit: args['faust-rs-commit'] || null,
        faustLibrariesCommit: args['faustlibraries-commit'] || null,
    },
};

const readme = `# ${PACKAGE_NAME}

The [Faust](https://faust.grame.fr/) compiler — the Rust implementation,
[faust-rs](https://github.com/grame-cncm/faust-rs) — built for
\`wasm32-unknown-unknown\` with the **AssemblyScript backend** enabled and the
Faust standard libraries embedded.

This package ships one artifact, \`${MODULE_FILE}\`, and no JavaScript. It is
the compiler module loaded by
[WebAssembly Music](${REPO_URL}) to turn \`.dsp\` sources into AssemblyScript.

## Using it

The module is a plain wasm32 module: no emscripten loader, no MEMFS, no
imports.

\`\`\`js
const bytes = await (await fetch(
  'https://cdn.jsdelivr.net/npm/${PACKAGE_NAME}@${args.version}/${MODULE_FILE}'
)).arrayBuffer();
const { instance } = await WebAssembly.instantiate(bytes, {});
\`\`\`

Compilation goes through \`faust_wasm_generate_aux_files_json(name, source, args)\`,
with strings written into memory via \`faust_wasm_alloc\`. Failures carry a
structured diagnostics-v2 report on the result handle
(\`faust_wasm_text_result_diagnostics_ptr\`/\`_len\`). See
[faust-rs-transpile.js](${REPO_URL}/blob/master/wasmaudioworklet/faust/faust-rs-transpile.js)
for a complete working host, and the
[faust-rs error model](https://github.com/grame-cncm/faust-rs) for the
diagnostics schema.

Because \`import("stdfaust.lib")\` resolves from libraries embedded at build
time, no library files need to be provided at runtime. Sibling sources travel
inline as \`--virtual-source <path>=<base64>\` arguments.

## This build

| | |
|---|---|
| compiler module | \`${moduleVersion}\` |
| faust-rs commit | \`${packageJson.faustRs.faustRsCommit || 'unrecorded'}\` |
| faustlibraries commit | \`${packageJson.faustRs.faustLibrariesCommit || 'unrecorded'}\` |

Built and published by
[this workflow](${REPO_URL}/blob/master/.github/workflows/publish-faust-compiler-module.yml),
which validates every module before release.

## License

The compiler is **GRAME's** work, not this project's:

> faust-rs — a Rust port of the FAUST compiler
> Copyright (C) 2026 GRAME, Centre National de Creation Musicale
> Derived from the FAUST compiler, Copyright (C) 2003-2024 GRAME.

Licensed under **LGPL-2.1-or-later**; the full text is in \`LICENSE\`, copied
from the faust-rs revision this module was built from. This package only
repackages that build for npm.
`;

fs.writeFileSync(path.join(outDir, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, MODULE_FILE), moduleBytes);
fs.writeFileSync(path.join(outDir, 'README.md'), readme);
fs.copyFileSync(args.license, path.join(outDir, 'LICENSE'));

console.log(`${PACKAGE_NAME}@${args.version} staged in ${outDir}`);
console.log(`  ${MODULE_FILE}  ${moduleBytes.length} bytes (${moduleVersion})`);
console.log(`  LICENSE         from ${path.resolve(args.license)}`);
