import { waitForAppReady } from '../app.js';
import { songsourceeditor, synthsourceeditor } from '../editorcontroller.js';
import { clarinetSource, dx7Source, piano1Source } from './faust-test-sources.js';

const songsource = `
setBPM(120);

await createTrack(0).steps(4, [
    c4,,e4,,
    g4,,c5,,
]);

loopHere();
`;

async function waitForCompileResult(appElement) {
    window.WASM_SYNTH_BYTES = null;

    appElement.querySelector('#savesongbutton').click();

    const errorElement = appElement.querySelector('#errormessages span');
    for (let i = 0; i < 50; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (window.WASM_SYNTH_BYTES) {
            return { wasm: window.WASM_SYNTH_BYTES };
        }
        if (errorElement && errorElement.innerText) {
            return { error: errorElement.innerText };
        }
    }
    return { error: 'Timed out waiting for compilation result' };
}

describe('faust2as transpiled synth compilation', function () {
    this.timeout(60000);

    this.beforeAll(async () => {
        document.documentElement.appendChild(document.createElement('app-javascriptmusic'));
        await waitForAppReady();
    });

    this.afterAll(async () => {
        window.stopaudio();
        window.audioworkletnode = undefined;
        document.documentElement.removeChild(document.querySelector('app-javascriptmusic'));
    });

    it('should compile transpiled clarinet synth to WASM', async () => {
        songsourceeditor.doc.setValue(songsource);
        synthsourceeditor.doc.setValue(clarinetSource);
        const appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;

        const result = await waitForCompileResult(appElement);

        assert.isUndefined(result.error, `Compile error: ${result.error || ''}`);
        assert.isDefined(result.wasm, 'Expected WASM binary');
        assert.isAbove(result.wasm.length, 1000,
            'Clarinet WASM binary should be > 1000 bytes');
    });

    it('should compile transpiled dx7 synth to WASM', async () => {
        songsourceeditor.doc.setValue(songsource);
        synthsourceeditor.doc.setValue(dx7Source);
        const appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;

        const result = await waitForCompileResult(appElement);

        assert.isUndefined(result.error, `Compile error: ${result.error || ''}`);
        assert.isDefined(result.wasm, 'Expected WASM binary');
        assert.isAbove(result.wasm.length, 1000,
            'DX7 WASM binary should be > 1000 bytes');
    });

    it('should compile transpiled piano1 synth to WASM', async () => {
        songsourceeditor.doc.setValue(songsource);
        synthsourceeditor.doc.setValue(piano1Source);
        const appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;

        const result = await waitForCompileResult(appElement);

        assert.isUndefined(result.error, `Compile error: ${result.error || ''}`);
        assert.isDefined(result.wasm, 'Expected WASM binary');
        assert.isAbove(result.wasm.length, 1000,
            'Piano1 WASM binary should be > 1000 bytes');
    });
});
