import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { inflateRawSync } from 'node:zlib';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildZip, zipRepo } from './repozip.js';

// A zip this app writes has to be readable by everything else — the whole
// point is getting a project OUT of origin-private storage. So these check the
// bytes against Node's own inflate and, where available, the system `unzip`,
// rather than only against a reader written alongside the writer.

const bytes = (s) => new TextEncoder().encode(s);

function haveUnzip() {
    try { execFileSync('unzip', ['-v'], { stdio: 'ignore' }); return true; } catch { return false; }
}

// Minimal central-directory reader: enough to assert structure and to pull each
// entry's stored/deflated body back out.
function readEntries(buf) {
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    let eocd = buf.length - 22;
    while (eocd >= 0 && view.getUint32(eocd, true) !== 0x06054b50) eocd--;
    assert.ok(eocd >= 0, 'end-of-central-directory signature not found');
    const count = view.getUint16(eocd + 10, true);
    let at = view.getUint32(eocd + 16, true);
    const entries = [];
    for (let i = 0; i < count; i++) {
        assert.equal(view.getUint32(at, true), 0x02014b50, 'central header signature');
        const method = view.getUint16(at + 10, true);
        const compSize = view.getUint32(at + 20, true);
        const rawSize = view.getUint32(at + 24, true);
        const nameLen = view.getUint16(at + 28, true);
        const localAt = view.getUint32(at + 42, true);
        const name = new TextDecoder().decode(buf.subarray(at + 46, at + 46 + nameLen));
        // Body sits after the local header, which repeats name + extra lengths.
        const localNameLen = view.getUint16(localAt + 26, true);
        const localExtraLen = view.getUint16(localAt + 28, true);
        const bodyAt = localAt + 30 + localNameLen + localExtraLen;
        const body = buf.subarray(bodyAt, bodyAt + compSize);
        entries.push({ name, method, rawSize, body });
        at += 46 + nameLen + view.getUint16(at + 30, true) + view.getUint16(at + 32, true);
    }
    return entries;
}

const decode = (entry) =>
    entry.method === 0 ? Buffer.from(entry.body) : inflateRawSync(Buffer.from(entry.body));

test('every file round-trips byte for byte', async () => {
    const files = [
        { path: 'song.js', bytes: bytes('setBPM(112);\n'.repeat(50)) },
        { path: 'faust/kick.dsp', bytes: bytes('import("stdfaust.lib");\n') },
        { path: 'bin.dat', bytes: new Uint8Array([0, 1, 2, 255, 254, 0, 0, 128]) },
    ];
    const buf = new Uint8Array(await (await buildZip(files)).arrayBuffer());
    const entries = readEntries(buf);

    assert.equal(entries.length, files.length);
    for (const original of files) {
        const entry = entries.find((e) => e.name === original.path);
        assert.ok(entry, `${original.path} present`);
        assert.equal(entry.rawSize, original.bytes.length);
        assert.deepEqual(new Uint8Array(decode(entry)), original.bytes);
    }
});

test('compressible text is deflated, already-compressed data is stored', async () => {
    const files = [
        { path: 'song.js', bytes: bytes('a'.repeat(5000)) },
        { path: '.git/objects/ab/cdef', bytes: new Uint8Array(2000).fill(7) },
        { path: 'cover.png', bytes: new Uint8Array(2000).fill(9) },
    ];
    const entries = readEntries(new Uint8Array(await (await buildZip(files)).arrayBuffer()));
    // Highly repetitive text must actually compress, or deflate is not running.
    const song = entries.find((e) => e.name === 'song.js');
    assert.equal(song.method, 8, 'deflated');
    assert.ok(song.body.length < 5000 / 10, 'meaningfully smaller');
    // Git objects and images are already compressed — re-deflating only costs time.
    assert.equal(entries.find((e) => e.name === '.git/objects/ab/cdef').method, 0, 'git object stored');
    assert.equal(entries.find((e) => e.name === 'cover.png').method, 0, 'png stored');
});

test('a real unzip accepts the archive', { skip: !haveUnzip() && 'unzip not installed' }, async () => {
    const files = [
        { path: 'song.js', bytes: bytes('loopHere();\n') },
        { path: 'faust/bass.dsp', bytes: bytes('process = os.osc(55);\n') },
        { path: '.git/HEAD', bytes: bytes('ref: refs/heads/master\n') },
    ];
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'repozip-'));
    const zipPath = path.join(dir, 'p.zip');
    fs.writeFileSync(zipPath, Buffer.from(await (await buildZip(files)).arrayBuffer()));

    // -t is unzip's own integrity check: CRCs, headers, the lot.
    const testOut = execFileSync('unzip', ['-t', zipPath], { encoding: 'utf8' });
    assert.match(testOut, /No errors detected/);

    execFileSync('unzip', ['-o', '-q', zipPath, '-d', path.join(dir, 'out')]);
    for (const f of files) {
        const got = fs.readFileSync(path.join(dir, 'out', f.path));
        assert.deepEqual(new Uint8Array(got), f.bytes, `${f.path} extracted intact`);
    }
    fs.rmSync(dir, { recursive: true, force: true });
});

test('refuses to write an archive that needs Zip64 rather than a broken one', async () => {
    const many = Array.from({ length: 70000 }, (_, i) => ({ path: `f${i}`, bytes: new Uint8Array(0) }));
    await assert.rejects(() => buildZip(many), /Zip64/);
});

test('zipRepo asks for the git directory and reads every file as bytes', async () => {
    const asked = { includeGit: null, binary: [] };
    const git = {
        listfiles: async (prefix, opts) => { asked.includeGit = opts?.includeGit; return ['song.js', '.git/HEAD']; },
        readfile: async (p, _ms, opts) => { asked.binary.push(opts?.binary); return bytes(`contents of ${p}`); },
    };
    const { fileCount, unreadable } = await zipRepo(git);
    assert.equal(asked.includeGit, true, 'history must be included');
    assert.deepEqual(asked.binary, [true, true], 'binary reads — UTF-8 would corrupt git objects');
    assert.equal(fileCount, 2);
    assert.deepEqual(unreadable, []);
});

test('one unreadable file does not lose the whole export', async () => {
    const git = {
        listfiles: async () => ['good.js', 'bad.bin'],
        readfile: async (p) => {
            if (p === 'bad.bin') throw new Error('EIO');
            return bytes('fine');
        },
    };
    const { fileCount, unreadable } = await zipRepo(git);
    assert.equal(fileCount, 1);
    assert.equal(unreadable.length, 1);
    assert.match(unreadable[0], /bad\.bin/);
});

test('an empty repo is an error, not an empty zip', async () => {
    const git = { listfiles: async () => [], readfile: async () => bytes('') };
    await assert.rejects(() => zipRepo(git), /empty/);
});

test('empty directories survive — a repo without .git/refs is not a repo', async () => {
    const files = [
        { path: '.git/HEAD', bytes: bytes('ref: refs/heads/master\n') },
        { path: '.git/refs/', bytes: new Uint8Array(0) },   // empty in a fresh repo
        { path: '.git/refs/heads/', bytes: new Uint8Array(0) },
    ];
    const entries = readEntries(new Uint8Array(await (await buildZip(files)).arrayBuffer()));
    const dir = entries.find((e) => e.name === '.git/refs/');
    assert.ok(dir, 'directory entry present');
    assert.equal(dir.rawSize, 0);
    assert.equal(dir.method, 0, 'stored, never deflated');
});

test('zipRepo asks for directories so empty ones are not dropped', async () => {
    let opts = null;
    const git = {
        listfiles: async (_p, o) => { opts = o; return ['song.js', 'faust/']; },
        readfile: async () => bytes('x'),
    };
    const { fileCount } = await zipRepo(git);
    assert.equal(opts?.includeDirs, true);
    // The directory is an entry too, and must not have been read as a file.
    assert.equal(fileCount, 2);
});
