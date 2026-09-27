// faust-files.js — saving Faust sources in the project repo, shared by the
// Faust editor and the studio agent so both do exactly the same thing.
//
// A .dsp is an instrument: saving it transpiles it (with its sibling .dsp/.lib
// files, which `import("x.lib")` / `library("x.dsp")` resolve against) into the
// .ts next to it. A .lib is a library: it has no .ts of its own, but every
// instrument that imports it - directly, or through another library - has its
// code compiled in, so saving a .lib re-transpiles those instruments.
//
// The repo functions are passed in (`io`), so the logic runs in Node tests too:
//   io = { readfile(path), listfiles(prefix), writefileandstage(path, text),
//          transpile(source, basename, libs) -> { ts, className } }

export const isFaustSource = (p) => /\.(dsp|lib)$/.test(p);
export const isLibrary = (p) => p.endsWith('.lib');
const dirOf = (p) => p.substring(0, p.lastIndexOf('/') + 1);

/** Every .dsp/.lib in the source's folder (and below) except the source,
 *  keyed by its path relative to that folder - what the transpiler mounts. */
export async function collectSiblingLibs(io, sourcePath) {
    const dir = dirOf(sourcePath);
    const all = await io.listfiles(dir);
    const libs = {};
    await Promise.all(all.map(async (p) => {
        if (p === sourcePath || !isFaustSource(p)) return;
        try { libs[p.substring(dir.length)] = await io.readfile(p); } catch (_) { /* skip */ }
    }));
    return libs;
}

// The repo paths a Faust source imports (import/library with a literal path,
// resolved against the source's folder).
function importsOf(path, source) {
    const dir = dirOf(path);
    const out = new Set();
    for (const m of String(source || '').matchAll(/\b(?:import|library)\s*\(\s*"([^"]+)"\s*\)/g)) {
        out.add(dir + m[1].replace(/^\.\//, ''));
    }
    return out;
}

/** The instruments (.dsp) that use `libPath`, directly or through other
 *  libraries, under `root` (the Faust folder). Sorted paths. */
export async function libraryDependents(io, libPath, root) {
    const files = (await io.listfiles(root)).filter(isFaustSource);
    const imports = new Map();
    await Promise.all(files.map(async (p) => {
        try { imports.set(p, importsOf(p, await io.readfile(p))); } catch (_) { imports.set(p, new Set()); }
    }));
    const reached = new Set([libPath]);
    for (let grew = true; grew;) {
        grew = false;
        for (const p of files) {
            if (!isLibrary(p) || reached.has(p)) continue;
            if ([...imports.get(p)].some((i) => reached.has(i))) { reached.add(p); grew = true; }
        }
    }
    return files.filter((p) => !isLibrary(p) && [...imports.get(p)].some((i) => reached.has(i))).sort();
}

/** Transpile one instrument with its siblings and write its .ts. Throws the
 *  transpiler's error (with its diagnostics) on failure. */
export async function transpileInstrument(io, dspPath, source = null, root = dspPath) {
    const src = source ?? await io.readfile(dspPath);
    const libs = await collectSiblingLibs(io, dspPath);
    const { ts, className } = await io.transpile(src, dspPath.substring(dirOf(root).length), libs);
    await io.writefileandstage(dspPath.replace(/\.dsp$/, '.ts'), ts);
    return { ts, className, libsCount: Object.keys(libs).length };
}

/**
 * Save a Faust source. The source is written FIRST, so a transpile error never
 * loses the edit.
 *  - .dsp → { kind: 'dsp', ts, className, libsCount }; throws on a transpile error.
 *  - .lib → { kind: 'lib', rebuilt: [{ path, className }], failed: [{ path, error }] }.
 */
export async function saveFaustSource(io, path, source, root) {
    await io.writefileandstage(path, source);
    if (!isLibrary(path)) {
        return { kind: 'dsp', ...(await transpileInstrument(io, path, source, root)) };
    }
    const rebuilt = [], failed = [];
    for (const dsp of await libraryDependents(io, path, root)) {
        try { rebuilt.push({ path: dsp, className: (await transpileInstrument(io, dsp, null, root)).className }); }
        catch (e) { failed.push({ path: dsp, error: e }); }
    }
    return { kind: 'lib', rebuilt, failed };
}
