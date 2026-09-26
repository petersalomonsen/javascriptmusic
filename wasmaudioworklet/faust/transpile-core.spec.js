// transpile-core.spec.js — the native faust-rs asc output is split into a
// shared helper preamble, per-DSP table-generator sub-modules, and the class.
// Since faust-rs 0.7.0 (`--table-init runtime` by default) any constant table
// (os.osc's sine table, say) arrives as a `<module>SIG<n>` sub-module ahead of
// the class; treating that block as part of the deduplicated helper preamble
// made a voice+effect file either declare the 14 math helpers twice
// (TS2300 in asc) or lose a sub-module. Synthetic fixtures — the real shape
// is exercised end to end by e2e/faust-rs-transpile.spec.js.
import { splitNativeSource, transpileDsp, assembleSingleFile, assembleBundle, transpileEffect } from './transpile-core.js';

const HELPERS = `function _fmodf(a: f32, b: f32): f32 {
  return a % b;
}
function _rintf(x: f32): f32 {
  return Mathf.round(x);
}`;

function subModules(module, cls) {
    return `class ${module}SIG0 {
    fSampleRate: i32;
    fill${module}SIG0(count: i32, table: StaticArray<f32>): void {
        for (let i0: i32 = 0; i0 < count; i0 = i0 + 1) { table[i0] = 0.0; }
    }
}

function new${module}SIG0(): ${cls} {
    return changetype<${cls}>(new ${module}SIG0());
}

function fill${module}SIG0(dsp: ${cls}, count: i32, table: StaticArray<f32>): void {
    changetype<${module}SIG0>(dsp).fill${module}SIG0(count, table);
}`;
}

// A native-looking `-lang asc --ec --os` output: header comments, helpers,
// optional table sub-modules, then the class with its getJSON().
function nativeSource({ module, cls, withTable, inputs, outputs, ui, meta }) {
    const json = JSON.stringify({ name: module, inputs, outputs, ...(meta ? { meta } : {}), ui });
    const escaped = json.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `// Code generated with faust-rs 0.8.0 (https://faust.grame.fr)
// name: ${module}

${HELPERS}

${withTable ? subModules(module, cls) + '\n\n' : ''}export class ${cls} {
    fSampleRate: i32;
    getNumInputs(): i32 {
        return ${inputs};
    }
    getNumOutputs(): i32 {
        return ${outputs};
    }
    init(sample_rate: i32): void {
        this.fSampleRate = sample_rate;
    }
    getJSON(): string {
        return "${escaped}";
    }
    control(): void {
    }
    frame(inputs: StaticArray<f32>, outputs: StaticArray<f32>): void {
    }
}
`;
}

const slider = (label, init, min, max) => ({ type: 'hslider', label, varname: 'f' + label, address: '/x/' + label, init, min, max, step: 0.01 });
const button = label => ({ type: 'button', label, varname: 'f' + label, address: '/x/' + label });
const voiceUI = [{ type: 'vgroup', label: 'x', items: [slider('freq', 440, 20, 20000), slider('gain', 0.5, 0, 1), button('gate')] }];
const effectUI = [{ type: 'vgroup', label: 'x', items: [slider('depth', 0.5, 0, 1)] }];

const count = (text, needle) => text.split(needle).length - 1;

describe('transpile-core: native output split', () => {
    it('separates helpers, table sub-modules and the class', () => {
        const src = nativeSource({ module: 'foo', cls: 'FooDsp', withTable: true, inputs: 0, outputs: 1, ui: voiceUI });
        const { preamble, subModules: subs, classSource } = splitNativeSource(src, 'FooDsp');
        assert.include(preamble, 'function _fmodf');
        assert.notInclude(preamble, 'SIG0', 'sub-modules must not stay in the shared preamble');
        assert.notInclude(preamble, '//', 'header comments are dropped so preambles compare equal');
        assert.match(subs, /^class fooSIG0 \{/);
        assert.include(subs, 'function fillfooSIG0(dsp: FooDsp');
        assert.match(classSource, /^export class FooDsp \{/);
        assert.notInclude(classSource, 'getJSON');
    });

    it('yields an empty sub-module block when the DSP has no generated tables', () => {
        const src = nativeSource({ module: 'foo', cls: 'FooDsp', withTable: false, inputs: 0, outputs: 1, ui: voiceUI });
        const { preamble, subModules: subs } = splitNativeSource(src, 'FooDsp');
        assert.include(preamble, 'function _rintf');
        assert.strictEqual(subs, '');
    });

    it('emits the helpers once and every sub-module for a voice + effect file', () => {
        // The effect unit is compiled under a distinct source name (`<stem>_effect`)
        // by both callers, so its sub-modules cannot collide with the voice's.
        const result = transpileDsp({
            asSource: nativeSource({ module: 'foo', cls: 'FooDsp', withTable: true, inputs: 0, outputs: 1, ui: voiceUI }),
            effectAsSource: nativeSource({ module: 'foo_effect', cls: 'FooEffectDsp', withTable: true, inputs: 2, outputs: 2, ui: effectUI }),
            clsName: 'Foo',
            sourceFile: 'foo.dsp',
        });
        const ts = assembleSingleFile(result).join('\n');
        assert.strictEqual(count(ts, 'function _fmodf('), 1, ts);
        assert.strictEqual(count(ts, 'class fooSIG0 {'), 1, ts);
        assert.strictEqual(count(ts, 'class foo_effectSIG0 {'), 1, ts);
        assert.isBelow(ts.indexOf('class fooSIG0 {'), ts.indexOf('export class FooDsp {'));
        assert.isBelow(ts.indexOf('class foo_effectSIG0 {'), ts.indexOf('export class FooEffectDsp {'));
    });

    it('keeps each DSP\'s sub-modules in a bundle while sharing the helpers', () => {
        const results = ['alpha', 'beta'].map(module => transpileDsp({
            asSource: nativeSource({ module, cls: `${module[0].toUpperCase()}${module.slice(1)}Dsp`, withTable: true, inputs: 0, outputs: 1, ui: voiceUI }),
            clsName: module[0].toUpperCase() + module.slice(1),
            sourceFile: `${module}.dsp`,
        }));
        const ts = assembleBundle(results).join('\n');
        assert.strictEqual(count(ts, 'function _fmodf('), 1);
        assert.strictEqual(count(ts, 'class alphaSIG0 {'), 1);
        assert.strictEqual(count(ts, 'class betaSIG0 {'), 1);
    });

    it('sends a two-output voice to left and right, a one-output voice mono', () => {
        const voice = (outputs) => assembleSingleFile(transpileDsp({
            asSource: nativeSource({ module: 'foo', cls: 'FooDsp', withTable: false, inputs: 0, outputs, ui: voiceUI }),
            clsName: 'Foo',
            sourceFile: 'foo.dsp',
        })).join('\n');
        const stereo = voice(2);
        assert.include(stereo, 'const output1: f32 = this.fout[1];');
        assert.include(stereo, 'this.channel.signal.add(output * 0.25, output1 * 0.25);');
        assert.notInclude(stereo, 'addMonoSignal');
        const mono = voice(1);
        assert.include(mono, 'this.channel.signal.addMonoSignal(output, 0.5, 0.5);');
        assert.notInclude(mono, 'output1');
    });

    it('pre-rolls a voice that declares it, with the preroll button held', () => {
        const ui = [{ type: 'vgroup', label: 'x', items: [...voiceUI[0].items, { type: 'button', label: 'preroll', varname: 'fButtonP', address: '/x/preroll' }] }];
        const voice = (meta) => assembleSingleFile(transpileDsp({
            asSource: nativeSource({ module: 'foo', cls: 'FooDsp', withTable: false, inputs: 0, outputs: 2, ui, meta }),
            clsName: 'Foo',
            sourceFile: 'foo.dsp',
        })).join('\n');
        const ts = voice([{ preroll: '0.02' }]);
        const on = ts.slice(ts.indexOf('noteon('), ts.indexOf('noteoff('));
        assert.include(on, 'this.dsp.fButtonP = 1.0;');
        assert.include(on, 'for (let i = 0, n = <i32>(<f32>0.02 * SAMPLERATE); i < n; i++) this.dsp.frame(this.fin, this.fout);');
        // released before the gate opens
        assert.isBelow(on.indexOf('this.dsp.fButtonP = 0.0;'), on.indexOf('this.dsp.fgate = 1.0;'));
        // the button is not a channel parameter
        assert.notInclude(ts, 'typedChannel.preroll');
        // no declaration, no pre-roll
        assert.notInclude(voice(undefined), 'fButtonP = 1.0');
    });

    it('carries the sub-modules of a standalone stereo effect', () => {
        const lines = transpileEffect({
            asSource: nativeSource({ module: 'verb', cls: 'VerbDsp', withTable: true, inputs: 2, outputs: 2, ui: effectUI }),
            clsName: 'Verb',
            sourceFile: 'verb.dsp',
        });
        const ts = lines.join('\n');
        assert.strictEqual(count(ts, 'class verbSIG0 {'), 1);
        assert.isBelow(ts.indexOf('class verbSIG0 {'), ts.indexOf('export class VerbDsp {'));
    });
});
