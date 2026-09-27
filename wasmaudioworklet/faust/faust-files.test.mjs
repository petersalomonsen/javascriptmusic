// faust-files.js against an in-memory repo: saving an instrument transpiles it
// with its siblings; saving a library re-transpiles the instruments that
// import it (directly or through another library) and nothing else.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saveFaustSource, libraryDependents, collectSiblingLibs, clearScratch, scratchImports } from './faust-files.js';
import { normDsp } from '../studio-agent/tools-core.js';

function repo(files) {
    const fs = new Map(Object.entries(files));
    const transpiled = [];
    const staged = new Set();
    const io = {
        readfile: async (p) => { if (!fs.has(p)) throw Object.assign(new Error('FS error'), { errno: 44 }); return fs.get(p); },
        listfiles: async (prefix) => [...fs.keys()].filter((p) => p.startsWith(prefix)),
        writefileandstage: async (p, t, { stage = true } = {}) => { fs.set(p, t); if (stage) staged.add(p); },
        unlinkfile: async (p) => { fs.delete(p); },
        transpile: async (source, name, libs) => {
            if (source.includes('BROKEN')) throw new Error(`syntax error in ${name}`);
            transpiled.push({ name, libs: Object.keys(libs).sort() });
            return { ts: `// ts of ${name}`, className: name.replace(/\.dsp$/, '') };
        },
    };
    return { fs, io, transpiled, staged };
}

const FILES = {
    'faust/monster.lib': 'import("stdfaust.lib");\nwaveguide = _;',
    'faust/drumkit.lib': 'import("monster.lib");\nkit = waveguide;',
    'faust/mpiano.dsp': 'import("monster.lib");\nprocess = waveguide;',
    'faust/mdrums.dsp': 'import("drumkit.lib");\nprocess = kit;',
    'faust/warmpad.dsp': 'import("stdfaust.lib");\nprocess = os.osc(440);',
    'faust/mpiano.ts': '// old',
};

test('saving an instrument writes it first, then transpiles it with its sibling .dsp/.lib files', async () => {
    const { fs, io, transpiled } = repo(FILES);
    const r = await saveFaustSource(io, 'faust/mpiano.dsp', 'import("monster.lib");\nprocess = waveguide * 2;', 'faust/');
    assert.equal(r.kind, 'dsp');
    assert.equal(fs.get('faust/mpiano.dsp'), 'import("monster.lib");\nprocess = waveguide * 2;');
    assert.equal(fs.get('faust/mpiano.ts'), '// ts of mpiano.dsp');
    assert.deepEqual(transpiled, [{ name: 'mpiano.dsp', libs: ['drumkit.lib', 'mdrums.dsp', 'monster.lib', 'warmpad.dsp'] }]);
});

test('saving a library re-transpiles the instruments that use it, directly or through another library', async () => {
    const { fs, io, transpiled } = repo(FILES);
    assert.deepEqual(await libraryDependents(io, 'faust/monster.lib', 'faust/'), ['faust/mdrums.dsp', 'faust/mpiano.dsp']);
    const r = await saveFaustSource(io, 'faust/monster.lib', 'import("stdfaust.lib");\nwaveguide = *(0.5);', 'faust/');
    assert.equal(r.kind, 'lib');
    assert.deepEqual(r.rebuilt.map((x) => x.path), ['faust/mdrums.dsp', 'faust/mpiano.dsp']);
    assert.deepEqual(r.failed, []);
    assert.equal(fs.get('faust/monster.lib'), 'import("stdfaust.lib");\nwaveguide = *(0.5);');
    assert.deepEqual(transpiled.map((t) => t.name), ['mdrums.dsp', 'mpiano.dsp']);   // warmpad untouched
    assert.equal(fs.has('faust/monster.ts'), false, 'a library has no .ts of its own');
});

test('an instrument that fails to transpile is reported; the library and the others are saved', async () => {
    const { fs, io } = repo({ ...FILES, 'faust/mpiano.dsp': 'import("monster.lib");\nBROKEN' });
    const r = await saveFaustSource(io, 'faust/monster.lib', 'waveguide = _;', 'faust/');
    assert.deepEqual(r.rebuilt.map((x) => x.path), ['faust/mdrums.dsp']);
    assert.deepEqual(r.failed.map((x) => x.path), ['faust/mpiano.dsp']);
    assert.equal(fs.get('faust/monster.lib'), 'waveguide = _;');
});

test('an instrument transpile error throws after the source is written', async () => {
    const { fs, io } = repo(FILES);
    await assert.rejects(saveFaustSource(io, 'faust/mpiano.dsp', 'BROKEN', 'faust/'), /syntax error/);
    assert.equal(fs.get('faust/mpiano.dsp'), 'BROKEN');
});

test('siblings are keyed relative to the source folder, sub-folders included', async () => {
    const { io } = repo({ 'faust/song/dsp/master.dsp': 'x', 'faust/song/dsp/lib/eq.lib': 'y', 'faust/other.dsp': 'z' });
    assert.deepEqual(Object.keys(await collectSiblingLibs(io, 'faust/song/dsp/master.dsp')), ['lib/eq.lib']);
});

test('normDsp: .dsp is the default extension, a .lib path stays a library', () => {
    assert.equal(normDsp('mpiano'), 'mpiano.dsp');
    assert.equal(normDsp('faust/mpiano.dsp'), 'mpiano.dsp');
    assert.equal(normDsp('monster.lib'), 'monster.lib');
    assert.equal(normDsp('faust/monster.lib'), 'monster.lib');
});

test('a scratch experiment sees the project files, shadows them with its own, and is never staged', async () => {
    const { fs, io, transpiled, staged } = repo({ ...FILES, 'faust/scratch/drumkit.lib': 'kit = _;' });
    await saveFaustSource(io, 'faust/scratch/probe.dsp', 'import("monster.lib");\nprocess = waveguide;', 'faust/');
    assert.deepEqual(transpiled, [{ name: 'scratch/probe.dsp',
        libs: ['drumkit.lib', 'mdrums.dsp', 'monster.lib', 'mpiano.dsp', 'scratch/drumkit.lib', 'warmpad.dsp'] }]);
    const libs = await collectSiblingLibs(io, 'faust/scratch/probe.dsp', 'faust/');
    assert.equal(libs['drumkit.lib'], 'kit = _;', "scratch/'s own copy wins");
    assert.equal(fs.get('faust/scratch/probe.ts'), '// ts of scratch/probe.dsp');
    assert.equal(fs.get('faust/scratch/.gitignore'), '*\n');
    assert.deepEqual([...staged], [], 'nothing under scratch/ is staged');
});

test('a library edit does not rebuild scratch experiments; the instruments are still staged', async () => {
    const { io, transpiled, staged } = repo({ ...FILES, 'faust/scratch/probe.dsp': 'import("monster.lib");\nprocess = waveguide;' });
    await saveFaustSource(io, 'faust/monster.lib', 'waveguide = _;', 'faust/');
    assert.deepEqual(transpiled.map((t) => t.name), ['mdrums.dsp', 'mpiano.dsp']);
    assert.ok(staged.has('faust/monster.lib') && staged.has('faust/mpiano.ts'));
});

test('clearScratch deletes everything under scratch/ and nothing else', async () => {
    const { fs, io } = repo({ ...FILES, 'faust/scratch/probe.dsp': 'x', 'faust/scratch/probe.ts': 'y', 'faust/scratch/.gitignore': '*\n' });
    assert.deepEqual((await clearScratch(io, 'faust/')).sort(), ['faust/scratch/.gitignore', 'faust/scratch/probe.dsp', 'faust/scratch/probe.ts']);
    assert.deepEqual([...fs.keys()].sort(), Object.keys(FILES).sort());
    assert.deepEqual(await clearScratch(io, 'faust/'), []);
});

test('scratchImports finds a synth.ts that still imports an experiment', () => {
    const synth = "import { Mpiano } from './faust/mpiano';\nimport { Probe } from './faust/scratch/probe';\n";
    assert.deepEqual(scratchImports(synth), ["import { Probe } from './faust/scratch/probe';"]);
    assert.deepEqual(scratchImports("import { Mpiano } from './faust/mpiano';"), []);
});
