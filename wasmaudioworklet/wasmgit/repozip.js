// Build a .zip of the OPFS git repo, in the browser, with no dependency.
//
// The app has no zip library and does not need one: `CompressionStream` gives
// real deflate natively, and the rest of the format is a few headers. Adding a
// bundled dependency for this would be more code, not less.
//
// The archive includes `.git`, so what comes out is a working clone — you can
// unzip it, `git log`, and push it somewhere. That is the point: a project that
// only exists inside a browser's origin-private storage is a project you can
// lose. Git objects are already deflate-compressed, so they are STORED rather
// than deflated again (compressing them a second time only wastes time).

const LOCAL_SIG = 0x04034b50;
const CENTRAL_SIG = 0x02014b50;
const EOCD_SIG = 0x06054b50;
const METHOD_STORE = 0;
const METHOD_DEFLATE = 8;
// The ZIP header count fields are 16-bit; past this the archive needs Zip64,
// which is a different format. Refuse rather than emit something subtly broken.
const MAX_ENTRIES = 0xffff;

let crcTable = null;
function crc32(bytes) {
    if (!crcTable) {
        crcTable = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            crcTable[n] = c >>> 0;
        }
    }
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
}

async function deflateRaw(bytes) {
    if (typeof CompressionStream !== 'function') return null;
    try {
        const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
        return new Uint8Array(await new Response(stream).arrayBuffer());
    } catch {
        return null; // deflate-raw unsupported — fall back to storing
    }
}

// DOS date/time. A fixed timestamp would make every export byte-identical,
// which is tempting for tests but shows every file as 1980 in a file manager.
function dosDateTime(date) {
    const year = Math.max(1980, date.getFullYear());
    return {
        time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
        date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    };
}

function u8(...parts) {
    const total = parts.reduce((n, p) => n + p.length, 0);
    const out = new Uint8Array(total);
    let at = 0;
    for (const p of parts) { out.set(p, at); at += p.length; }
    return out;
}

function le(values) { // [[value, byteWidth], ...]
    const size = values.reduce((n, [, w]) => n + w, 0);
    const buf = new Uint8Array(size);
    const view = new DataView(buf.buffer);
    let at = 0;
    for (const [value, width] of values) {
        if (width === 2) view.setUint16(at, value, true);
        else view.setUint32(at, value, true);
        at += width;
    }
    return buf;
}

/**
 * @param {Array<{path: string, bytes: Uint8Array}>} files
 * @param {Date} [now] timestamp recorded for every entry
 * @returns {Promise<Blob>} a zip, ready to download
 */
export async function buildZip(files, now = new Date()) {
    if (files.length > MAX_ENTRIES) {
        throw new Error(`${files.length} files exceeds the ${MAX_ENTRIES}-entry limit of a plain zip (Zip64 not supported)`);
    }
    const { time, date } = dosDateTime(now);
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    for (const { path, bytes } of files) {
        // A trailing slash is a DIRECTORY entry: zero length, and the MS-DOS
        // directory attribute so every extractor recreates it even when empty.
        const isDir = path.endsWith('/');
        const name = encoder.encode(path);
        const crc = isDir ? 0 : crc32(bytes);
        // Already-compressed data (git objects, packfiles, png, wasm) does not
        // shrink again; skip the work and store it.
        const precompressed = isDir || /^\.git\/objects\//.test(path)
            || /\.(png|jpe?g|gif|webp|wasm|zip|mp3|mp4|ogg)$/i.test(path);
        const deflated = precompressed ? null : await deflateRaw(bytes);
        const useDeflate = deflated && deflated.length < bytes.length;
        const body = useDeflate ? deflated : bytes;
        const method = useDeflate ? METHOD_DEFLATE : METHOD_STORE;

        localParts.push(u8(
            le([[LOCAL_SIG, 4], [20, 2], [0, 2], [method, 2], [time, 2], [date, 2],
                [crc, 4], [body.length, 4], [bytes.length, 4], [name.length, 2], [0, 2]]),
            name, body,
        ));
        centralParts.push(u8(
            le([[CENTRAL_SIG, 4], [20, 2], [20, 2], [0, 2], [method, 2], [time, 2], [date, 2],
                [crc, 4], [body.length, 4], [bytes.length, 4], [name.length, 2],
                [0, 2], [0, 2], [0, 2], [0, 2], [isDir ? 0x10 : 0, 4], [offset, 4]]),
            name,
        ));
        offset += 30 + name.length + body.length;
    }

    const central = u8(...centralParts);
    const eocd = le([[EOCD_SIG, 4], [0, 2], [0, 2], [files.length, 2], [files.length, 2],
        [central.length, 4], [offset, 4], [0, 2]]);
    return new Blob([...localParts, central, eocd], { type: 'application/zip' });
}

/**
 * Read every file of the OPFS repo (including `.git`) and zip it.
 *
 * `readfile` is called with `{ binary: true }` — git objects, samples and wasm
 * are not text, and reading them as UTF-8 silently corrupts them.
 *
 * @param {{ listfiles: Function, readfile: Function }} git the wasm-git client
 * @param {(done: number, total: number, path: string) => void} [onProgress]
 */
export async function zipRepo(git, onProgress = () => {}) {
    const paths = await git.listfiles('', { includeGit: true, includeDirs: true });
    if (!paths.length) throw new Error('the repository is empty — nothing to export');

    const files = [];
    const unreadable = [];
    for (const [i, path] of paths.entries()) {
        onProgress(i, paths.length, path);
        // Directory entries carry no content — they exist so EMPTY ones survive.
        if (path.endsWith('/')) { files.push({ path, bytes: new Uint8Array(0) }); continue; }
        try {
            const contents = await git.readfile(path, 30000, { binary: true });
            files.push({ path, bytes: toBytes(contents) });
        } catch (e) {
            // One unreadable file must not lose the whole export; report which.
            unreadable.push(`${path}: ${e?.message || e}`);
        }
    }
    onProgress(paths.length, paths.length, '');
    return { blob: await buildZip(files), fileCount: files.length, unreadable };
}

function toBytes(contents) {
    if (contents instanceof Uint8Array) return contents;
    if (contents instanceof ArrayBuffer) return new Uint8Array(contents);
    return new TextEncoder().encode(String(contents));
}

/** Hand the blob to the browser as a download. */
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.documentElement.appendChild(a);
    a.click();
    a.remove();
    // Revoking immediately can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}
