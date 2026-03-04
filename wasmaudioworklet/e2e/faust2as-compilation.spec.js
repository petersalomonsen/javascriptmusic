import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SONG_SOURCE = `
setBPM(120);

await createTrack(0).steps(4, [
    c4,,e4,,
    g4,,c5,,
]);

loopHere();
`;

function loadTestSources() {
  const sourcePath = path.join(__dirname, '..', 'faust', 'faust-test-sources.js');
  if (!fs.existsSync(sourcePath)) {
    throw new Error(
      `faust-test-sources.js not found. Run: node tools/faust2as/generate-test-sources.js`
    );
  }
  const content = fs.readFileSync(sourcePath, 'utf-8');
  const sources = {};
  for (const match of content.matchAll(/export const (\w+)Source = `([\s\S]*?)`;/g)) {
    sources[match[1]] = match[2]
      .replace(/\\`/g, '`')
      .replace(/\\\$/g, '$')
      .replace(/\\\\/g, '\\');
  }
  return sources;
}

async function setEditorContent(page, editorSelector, content) {
  await page.evaluate(({ selector, text }) => {
    const shadowRoot = document.querySelector('app-javascriptmusic').shadowRoot;
    const editorEl = shadowRoot.querySelector(`${selector} .CodeMirror`);
    editorEl.CodeMirror.setValue(text);
  }, { selector: editorSelector, text: content });
}

async function clickButton(page, buttonId) {
  await page.evaluate((id) => {
    const shadowRoot = document.querySelector('app-javascriptmusic').shadowRoot;
    shadowRoot.getElementById(id).click();
  }, buttonId);
}

async function waitForCompileResult(page, timeoutMs = 60000) {
  return await page.evaluate(async (timeout) => {
    window.WASM_SYNTH_BYTES = null;
    const shadowRoot = document.querySelector('app-javascriptmusic').shadowRoot;
    shadowRoot.getElementById('savesongbutton').click();

    const errorElement = shadowRoot.querySelector('#errormessages span');
    const start = Date.now();
    while (Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (window.WASM_SYNTH_BYTES) {
        return { wasmLength: window.WASM_SYNTH_BYTES.length };
      }
      if (errorElement && errorElement.innerText) {
        return { error: errorElement.innerText };
      }
    }
    return { error: 'Timed out waiting for compilation result' };
  }, timeoutMs);
}

const sources = loadTestSources();

test.describe('faust2as transpiled synth compilation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => {
      const app = document.querySelector('app-javascriptmusic');
      return app && app.shadowRoot && app.shadowRoot.getElementById('startaudiobutton');
    }, { timeout: 30000 });
  });

  for (const [name, source] of Object.entries(sources)) {
    test(`should compile transpiled ${name} synth to WASM`, async ({ page }) => {
      await setEditorContent(page, '#editor', SONG_SOURCE);
      await setEditorContent(page, '#assemblyscripteditor', source);

      const result = await waitForCompileResult(page);

      expect(result.error).toBeUndefined();
      expect(result.wasmLength).toBeGreaterThan(1000);
    });
  }
});
