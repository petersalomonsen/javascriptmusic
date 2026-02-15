import { toggleSpinner } from '../common/ui/progress-spinner.js';

const FAUSTWASM_VERSION = '0.15.7';
const CDN_BASE = `https://cdn.jsdelivr.net/npm/@grame/faustwasm@${FAUSTWASM_VERSION}`;

let faustwasm;
let faustCompiler;

async function ensureFaustCompiler() {
    if (faustCompiler) return faustCompiler;

    toggleSpinner(true);
    console.log('loading faustwasm from CDN...');

    faustwasm = await import(
        /* webpackIgnore: true */
        `${CDN_BASE}/dist/esm-bundle/index.js`
    );

    const faustModule = await faustwasm.instantiateFaustModuleFromFile(
        `${CDN_BASE}/libfaust-wasm/libfaust-wasm.js`
    );

    const libFaust = new faustwasm.LibFaust(faustModule);
    faustCompiler = new faustwasm.FaustCompiler(libFaust);

    console.log('Faust compiler ready, version:', libFaust.version());
    toggleSpinner(false);

    return faustCompiler;
}

export async function compileFaustDSP(code) {
    const compiler = await ensureFaustCompiler();
    const generator = new faustwasm.FaustPolyDspGenerator();
    await generator.compile(compiler, "main", code, "-I libraries/");
    return generator;
}

export async function createFaustNode(audioContext, generator, voices = 8) {
    const node = await generator.createNode(audioContext, voices);
    return node;
}
