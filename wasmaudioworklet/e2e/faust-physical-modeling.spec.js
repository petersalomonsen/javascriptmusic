import { test, expect } from '@playwright/test';

const FAUST_MIDI_INSTRUMENTS = [
  'clarinetMIDI',
  'fluteMIDI',
  'violinMIDI',
  'brassMIDI',
  'guitarMIDI',
  'nylonGuitarMIDI',
  'elecGuitarMIDI',
  'djembeMIDI',
  'marimbaMIDI',
  'modularInterpInstrMIDI',
  'vocalBPMIDI',
  'vocalFOFMIDI',
];

const DSP_BASE_URL = 'https://raw.githubusercontent.com/grame-cncm/faustide/master/src/static/examples/physicalModeling';

const SONG_SOURCE = `
setBPM(120);

await createTrack(0).steps(4, [
    c4,,e4,,g4,,e4,,
    c5,,g4,,e4,,c4,,
]);

loopHere();
`;

async function fetchDSP(name) {
  const url = `${DSP_BASE_URL}/${name}.dsp`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return await response.text();
}

async function setEditorContent(page, editorSelector, content) {
  await page.evaluate(({ selector, text }) => {
    const shadowRoot = document.querySelector('app-javascriptmusic').shadowRoot;
    const editorEl = shadowRoot.querySelector(`${selector} .CodeMirror`);
    editorEl.CodeMirror.setValue(text);
  }, { selector: editorSelector, text: content });
}

async function focusKeyboard(page) {
  await page.evaluate(() => {
    const shadowRoot = document.querySelector('app-javascriptmusic').shadowRoot;
    shadowRoot.getElementById('vkeyboardinputelement').focus();
  });
}

async function clickButton(page, buttonId) {
  await page.evaluate((id) => {
    const shadowRoot = document.querySelector('app-javascriptmusic').shadowRoot;
    shadowRoot.getElementById(id).click();
  }, buttonId);
}

async function setCheckbox(page, checkboxId, checked) {
  await page.evaluate(({ id, value }) => {
    const shadowRoot = document.querySelector('app-javascriptmusic').shadowRoot;
    const checkbox = shadowRoot.getElementById(id);
    if (checkbox.checked !== value) {
      checkbox.click();
    }
  }, { id: checkboxId, value: checked });
}

async function waitForAudioWorkletNode(page, timeoutMs = 120000) {
  await page.waitForFunction(() => !!window.audioworkletnode, { timeout: timeoutMs });
}

async function playNote(page, key, durationMs = 300) {
  await page.keyboard.down(key);
  await page.waitForTimeout(durationMs);
  await page.keyboard.up(key);
  await page.waitForTimeout(50);
}

async function playMelody(page, notes) {
  for (const { key, duration } of notes) {
    await playNote(page, key, duration);
  }
}

// Ascending C major scale: C4, D4, E4, F4, G4, A4, B4, C5
const ASCENDING_SCALE = [
  { key: 'q', duration: 250 },
  { key: 'w', duration: 250 },
  { key: 'e', duration: 250 },
  { key: 'r', duration: 250 },
  { key: 't', duration: 250 },
  { key: 'y', duration: 250 },
  { key: 'u', duration: 250 },
  { key: 'i', duration: 400 },
];

// Short melodic phrase for hot-swap demos
const SHORT_PHRASE = [
  { key: 'q', duration: 200 },
  { key: 'e', duration: 200 },
  { key: 't', duration: 200 },
  { key: 'i', duration: 300 },
  { key: 't', duration: 200 },
  { key: 'e', duration: 200 },
  { key: 'q', duration: 400 },
];

test.describe('Faust Physical Modeling Instruments Demo', () => {
  test('cycle through all physical modeling instruments', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the app element to be present and initialized
    await page.waitForFunction(() => {
      const app = document.querySelector('app-javascriptmusic');
      return app && app.shadowRoot && app.shadowRoot.getElementById('startaudiobutton');
    }, { timeout: 30000 });

    // Wait for the start button to become enabled
    await page.waitForFunction(() => {
      const app = document.querySelector('app-javascriptmusic');
      return !app.shadowRoot.getElementById('startaudiobutton').disabled;
    }, { timeout: 30000 });

    // --- Load the first instrument ---
    const firstInstrument = FAUST_MIDI_INSTRUMENTS[0];
    console.log(`Loading first instrument: ${firstInstrument}`);
    const firstDSP = await fetchDSP(firstInstrument);

    // Set song and synth editor content
    await setEditorContent(page, '#editor', SONG_SOURCE);
    await setEditorContent(page, '#assemblyscripteditor', firstDSP);

    // Uncheck the sequencer toggle before starting (we'll play keyboard first)
    await setCheckbox(page, 'toggleSongPlayCheckbox', false);

    // Click play — this compiles the Faust DSP (takes a while)
    console.log('Starting audio with Faust compilation...');
    await clickButton(page, 'startaudiobutton');

    // Wait for the Faust node to be created
    await waitForAudioWorkletNode(page);
    console.log('Faust node ready');

    // --- Play keyboard notes with the first instrument ---
    await focusKeyboard(page);
    await page.waitForTimeout(500);

    console.log(`Playing scale with ${firstInstrument}`);
    await playMelody(page, ASCENDING_SCALE);
    await page.waitForTimeout(500);

    // --- Start the sequencer arpeggio ---
    console.log('Starting sequencer');
    await setCheckbox(page, 'toggleSongPlayCheckbox', true);
    await page.waitForTimeout(3000);

    // Play some notes on top of the running sequence
    await focusKeyboard(page);
    await playMelody(page, SHORT_PHRASE);
    await page.waitForTimeout(2000);

    // --- Cycle through remaining instruments via hot-swap ---
    for (let i = 1; i < FAUST_MIDI_INSTRUMENTS.length; i++) {
      const instrumentName = FAUST_MIDI_INSTRUMENTS[i];
      console.log(`Hot-swapping to: ${instrumentName} (${i + 1}/${FAUST_MIDI_INSTRUMENTS.length})`);

      // Fetch the DSP source
      const dspSource = await fetchDSP(instrumentName);

      // Set the synth editor content (visible code swap in the video)
      await setEditorContent(page, '#assemblyscripteditor', dspSource);

      // Save to trigger hot-swap (sequencer continues playing)
      await clickButton(page, 'savesongbutton');

      // Wait for recompilation — poll until the new node is connected
      console.log('Waiting for Faust recompilation...');
      await page.waitForFunction(() => !!window.audioworkletnode, { timeout: 120000 });
      await page.waitForTimeout(2000);

      // Play a short melody on top of the running sequence
      await focusKeyboard(page);
      await playMelody(page, SHORT_PHRASE);

      // Let the instrument play with the sequencer for a few seconds
      await page.waitForTimeout(4000);
    }

    // --- Stop ---
    console.log('Stopping audio');
    await clickButton(page, 'stopaudiobutton');
    await page.waitForTimeout(1000);
  });
});
