#!/usr/bin/env node
// verify-package.mjs — check the tarball that is about to be published.
//
//   node tools/faust-compiler-module/verify-package.mjs \
//     <extractedPackageDir> <expectedVersion> <sourceModule.wasm>
//
// Run against a directory unpacked from the tarball `npm pack` produced, not
// the directory it was built from: what ships is what gets checked. npm decides
// tarball contents from `files`, .npmignore and its own default rules, so
// "the staging directory looks right" is not the same claim.

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const [packageDir, expectedVersion, sourceModule] = process.argv.slice(2);
if (!packageDir || !expectedVersion || !sourceModule) {
    console.error('Usage: verify-package.mjs <extractedPackageDir> <expectedVersion> <sourceModule.wasm>');
    process.exit(2);
}

const PACKAGE_NAME = '@psalomo/wasm-music-faust';
const MODULE_FILE = 'faust-compiler-module.wasm';
const EXPECTED_FILES = ['LICENSE', 'README.md', MODULE_FILE, 'package.json'].sort();

const problems = [];

function listFiles(root) {
    const found = [];
    (function walk(dir, relBase) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
            if (entry.isDirectory()) walk(path.join(dir, entry.name), relPath);
            else found.push(relPath);
        }
    })(root, '');
    return found.sort();
}

// 1. Exactly the intended files — nothing dropped, nothing swept in.
const files = listFiles(packageDir);
if (JSON.stringify(files) !== JSON.stringify(EXPECTED_FILES)) {
    problems.push(`file list is ${JSON.stringify(files)}, expected ${JSON.stringify(EXPECTED_FILES)}`);
}

// 2. The module is the one that was validated, byte for byte.
const modulePath = path.join(packageDir, MODULE_FILE);
if (fs.existsSync(modulePath)) {
    const packed = fs.readFileSync(modulePath);
    const source = fs.readFileSync(sourceModule);
    const sha = buf => crypto.createHash('sha256').update(buf).digest('hex');
    if (sha(packed) !== sha(source)) {
        problems.push(`${MODULE_FILE} in the tarball does not match the validated build (${sha(packed)} vs ${sha(source)})`);
    }
    if (!(packed.length > 4 && packed[0] === 0x00 && packed[1] === 0x61 && packed[2] === 0x73 && packed[3] === 0x6d)) {
        problems.push(`${MODULE_FILE} does not start with the \\0asm magic`);
    }
} else {
    problems.push(`${MODULE_FILE} is missing from the tarball`);
}

// 3. Metadata that consumers and npm both depend on. `repository` matters
//    beyond documentation: provenance attestation fails with a 422 unless it
//    matches the repository the publishing workflow runs in.
const pkg = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8'));
const expectedFields = {
    name: PACKAGE_NAME,
    version: expectedVersion,
    license: 'LGPL-2.1-or-later',
};
for (const [field, expected] of Object.entries(expectedFields)) {
    if (pkg[field] !== expected) {
        problems.push(`package.json ${field} is ${JSON.stringify(pkg[field])}, expected ${JSON.stringify(expected)}`);
    }
}
const repoUrl = pkg.repository?.url;
if (repoUrl !== 'git+https://github.com/petersalomonsen/javascriptmusic.git') {
    problems.push(`package.json repository.url is ${JSON.stringify(repoUrl)} — provenance requires the publishing repository`);
}
if (!pkg.faustRs?.compilerModule) {
    problems.push('package.json is missing the faustRs.compilerModule provenance field');
}

// 4. The license text must be GRAME's, not a placeholder.
const license = fs.existsSync(path.join(packageDir, 'LICENSE'))
    ? fs.readFileSync(path.join(packageDir, 'LICENSE'), 'utf-8')
    : '';
if (!/GRAME/.test(license)) {
    problems.push('LICENSE does not carry the GRAME copyright — is it the faust-rs license?');
}

console.log(`${pkg.name}@${pkg.version} — ${files.length} files, module ${pkg.faustRs?.compilerModule}`);
console.log(`files: ${files.join(', ')}`);
console.log('');

if (problems.length > 0) {
    console.error('Package check FAILED:');
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
}
console.log('Package check passed.');
