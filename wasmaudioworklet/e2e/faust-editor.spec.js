import { test, expect } from '@playwright/test';
import {
    NEAR_REPO_CONTRACT,
    setupServiceWorker,
    clearOPFS,
    waitForAppReady,
    pushBaseline,
} from './near-git-helpers.js';

// End-to-end coverage for the in-app Faust editor:
//   - "faust" toolbar toggle reveals the editor area with file dropdown
//   - "New file" creates faust/<name>.dsp in the wasm-git repo
//   - Saving the song transpiles the .dsp to a sibling .ts in the repo
//   - The synth-side AS compiler picks up the transpiled .ts so the
//     mix can `import { ... } from '../faust/<name>';` and compile to wasm
//
// Requires the NEAR sandbox (`npm run near-sandbox`) — same prereq as
// near-git.spec.js.

const repoName = NEAR_REPO_CONTRACT + '.git';

// A trivial sawtooth voice-synth that maps freq/gain/gate to MIDI notes.
// The "attack" slider is a regular UI param — it becomes a module-level
// global with a name prefixed by the .dsp basename, so it doubles as a
// regression check that the prefix is the LEAF (no slashes from sub-paths).
const FAUST_SOURCE = `import("stdfaust.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);
attack = hslider("attack", 0.01, 0.001, 1.0, 0.001);
process = os.sawtooth(freq) * gain * en.adsr(attack, 0.1, 0.7, 0.2, gate) <: _, _;
`;

// Mix file referenced from the synth editor. Pulls in the transpiled module
// from the wasm-git repo's faust/ folder via `'../faust/<basename>'`.
// The literal string "midichannels" must appear in the source for the compiler
// worker's heuristic to route through mixes/midi.mix.ts (otherwise it tries
// to compile against the unrelated newyear mix). Putting it in a comment is
// enough — we don't actually use the import; the transpiled module already does.
const SYNTH_MIX_SOURCE = (basename) => `// uses midichannels (route via midi.mix)
import { initializeMidiSynth, postprocess } from '../faust/${basename}';
export { initializeMidiSynth, postprocess };
`;

const SONG_SOURCE = `setBPM(120);

await createTrack(0).steps(4, [
    c4,, e4,, g4,, c5,,
]);

loopHere();
`;

const CHORUS_DSP = `import("stdfaust.lib");

import("layout2.dsp");

voices = 8; // MUST BE EVEN
process = ba.bypass1to2(cbp,chorus_mono(dmax,curdel,rate,sigma,do2,voices));

dmax = 8192;
curdel = dmax * ckg(vslider("[0] Delay [midi:ctrl 4] [style:knob]", 0.5, 0, 1, 1)) : si.smooth(0.999);
rateMax = 7.0; // Hz
rateMin = 0.01;
rateT60 = 0.15661;
rate = ckg(vslider("[1] Rate [midi:ctrl 2] [unit:Hz] [style:knob]", 0.5, rateMin, rateMax, 0.0001))
    : si.smooth(ba.tau2pole(rateT60/6.91));

depth = ckg(vslider("[4] Depth [midi:ctrl 3] [style:knob]", 0.5, 0, 1, 0.001)) : si.smooth(ba.tau2pole(depthT60/6.91));

depthT60 = 0.15661;
delayPerVoice = 0.5*curdel/voices;
sigma = delayPerVoice * ckg(vslider("[6] Deviation [midi:ctrl 58] [style:knob]",0.5,0,1,0.001)) : si.smooth(0.999);

periodic = 1;

do2 = depth;   // use when depth=1 means "multivibrato" effect (no original => all are modulated)
cbp = 1-int(csg(vslider("[0] Enable [midi:ctrl 105][style:knob]",0,0,1,1)));

chorus_mono(dmax,curdel,rate,sigma,do2,voices)
	= _ <: (*(1-do2)<:_,_),(*(do2) <: par(i,voices,voice(i)) :> _,_) : ro.interleave(2,2) : +,+
    with {
        angle(i) = 2*ma.PI*(i/2)/voices + (i%2)*ma.PI/2;
        voice(i) = de.fdelay(dmax,min(dmax,del(i))) * cos(angle(i));
        del(i) = curdel*(i+1)/voices + dev(i);
        rates(i) = rate/float(i+1);
        dev(i) = sigma * os.oscp(rates(i),i*2*ma.PI/voices);
    };
`;
const LAYOUT2_DSP = `// This layout loosely follows the MiniMoog-V
// Arturia-only features are labeled
// Original versions also added where different

// Need vrocker and hrocker toggle switches in Faust!
// Need orange and blue color choices
//   Orange => Connect modulation sources to their destinations
//    Blue  => Turn audio sources On and Off
// - and later -
//   White  => Turn performance features On and Off
//   Black  => Select between modulation sources
//   Julius Smith for Analog Devices 3/1/2017

vrocker(x) = checkbox("%%x [style:vrocker]");
hrocker(x) = checkbox("%%x [style:hrocker]");
vrockerblue(x) = checkbox("%x  [style:vrocker] [color:blue]");
vrockerblue(x) = checkbox("%x [style:vrocker] [color:blue]");
 // USAGE: vrockerorange("[0] ModulationEnable");

hrockerblue(x) = checkbox("%%x [style:hrocker] [color:blue]");
vrockerred(x) = checkbox("%%x [style:vrocker] [color:red]");
hrockerred(x) = checkbox("%%x [style:hrocker] [color:red]");

declare designer "Robert A. Moog";

mmg(x) = hgroup("",x); // Minimoog + Effects
  synthg(x) = mmg(vgroup("[0] Minimoog",x));
  fxg(x) = mmg(hgroup("[1] Effects",x));
  mg(x) = synthg(hgroup("[0]",x));
    cg(x) = mg(vgroup("[0] Controllers",x)); // Formerly named "Modules" but "Minimoog" group-title is enough
      vg(x) = cg(hgroup("[0] Master Volume", x));
      dg(x) = cg(hgroup("[1] Oscillator Tuning & Switching", x));
        // Tune knob = master tune
        dsg(x) = dg(vgroup("[1] Switches", x));
	  // Oscillator Modulation HrockerRed => apply Modulation Mix output to osc1&2 pitches
	  // [MOVED here from osc3 group] Osc 3 Control VrockerRed => use osc3 as LFO instead of osc3
      gmmg(x) = cg(hgroup("[2] Glide and ModMix", x));
        // Glide knob [0:10] = portamento speed
        // Modulation Mix knob [0:10] (between Osc3 and Noise) = mix of noise and osc3 modulating osc1&2 pitch and/or VCF freq
    og(x) = mg(vgroup("[1] Oscillator Bank", x));
      osc1(x) = og(hgroup("[1] Oscillator 1", x));
        // UNUSED Control switch (for alignment) - Could put Oscillator Modulation switch there
        // Range rotary switch: LO (slow pulses or rhythm), 32', 16', 8', 4', 2'
        // Frequency <something> switch: LED to right
        // Waveform rotary switch: tri, impulse/bent-triangle, saw, pulseWide, pulseMed, pulseNarrow
      osc2(x) = og(hgroup("[2] Oscillator 2", x));
        // UNUSED (originall) or Osc 2 Control VrockerRed
        // Range rotary switch: LO, 32', 16', 8', 4', 2'
        // Detuning knob: -7 to 7 [NO SWITCH]
        // Waveform rotary switch: tri, impulse(?), saw, pulseWide, pulseMed, pulseNarrow
      osc3(x) = og(hgroup("[3] Oscillator 3", x));
        // Osc 3 Control VrockerRed => use osc3 as LFO instead of osc3
        // Range rotary switch: LO, 32', 16', 8', 4', 2'
        // Detuning knob: -7 to 7 [NO SWITCH]
        // Waveform rotary switch: tri, impulse(?), saw, pulseWide, pulseMed, pulseNarrow
    mixg(x) = mg(vgroup("[2] Mixer", x));
      // Each row 5 slots to maintain alignment and include red rockers joining VCF area:
      mr1(x) = mixg(hgroup("[0] Osc1", x)); // mixer row 1 =
      // Osc1 Volume and Osc1 HrockerBlue & _ & _ & Filter Modulation HrockerRed
      // Filter Modulation => Modulation Mix output to VCF freq
      mr2(x) = mixg(hgroup("[1] Ext In, KeyCtl", x)); // row 2 = Ext In HrockerBlue and Vol and Overload LED and Keyboard Ctl HrockerRed 1
      mr3(x) = mixg(hgroup("[2] Osc2", x)); // = Osc2 Volume and Osc2 HrockerBlue and Keyboard Ctl HrockerRed 2
      // Keyboard Control Modulation 1&2 => 0, 1/3, 2/3, all of Keyboard Control Signal ("gate?") applied to VCF freq
      mr4(x) = mixg(hgroup("[3] Noise", x)); // = Noise HrockerBlue and Volume and Noise Type VrockerBlue
        mr4cbg(x) = mr4(vgroup("[1]", x)); // = Noise Off and White/Pink selection
	// two rockers
      mr5(x) = mixg(hgroup("[4] Osc3", x)); //  Osc3 Volume and Osc3 HrockerBlue
    modg(x) = mg(vgroup("[3] Modifiers", x));
      vcfg(x) = modg(vgroup("[0] Filter", x));
        vcf1(x) = vcfg(hgroup("[0] [tooltip:freq, Q, ContourScale]", x));
	  vcf1cbg(x) = vcf1(vgroup("[0] [tooltip:two checkboxes]", x));
          // Filter Modulation switch
          // VCF Off switch
        // Corner Frequency knob
        // Filter Emphasis knob
        // Amount of Contour knob
        vcf2(x) = vcfg(hgroup("[1] Filter Contour [tooltip:AttFilt, DecFilt, Sustain Level for Filter Contour]", x));
        // Attack Time knob
        // Decay Time knob
        // Sustain Level knob
      ng(x) = modg(hgroup("[1] Loudness Contour", x));
        // Attack Time knob
        // Decay Time knob
        // Sustain Level knob
    echog(x) = fxg(hgroup("[4] Echo",x));
      ekg(x) = echog(vgroup("[0] Knobs",x));
      esg(x) = echog(vgroup("[1] Switches",x));
    flg(x) = fxg(hgroup("[5] Flanger",x));
      flkg(x) = flg(vgroup("[0] Knobs",x));
      flsg(x) = flg(vgroup("[1] Switches",x));
    chg(x) = fxg(hgroup("[6] Chorus",x));
      ckg(x) = chg(vgroup("[0] Knobs",x));
      csg(x) = chg(vgroup("[1] Switches",x));
    rg(x) = fxg(hgroup("[7] Reverb",x));
      rkg(x) = rg(vgroup("[0] Knobs",x));
      rsg(x) = rg(vgroup("[1] Switches",x));
    outg(x) = fxg(vgroup("[8] Output", x));
      volg(x) = outg(hgroup("[0] Volume Main Output", x));
        // Volume knob [0-10]
	// Unison switch (Arturia) or Output connect/disconnect switch (original)
	//   When set, all voices are stacked and instrument is in mono mode
      tunerg(x) = outg(hgroup("[1] A-440 Switch", x));
      vdtpolyg(x) = outg(hgroup("[2] Voice Detune / Poly", x));
        // Voice Detune knob [0-10] (Arturia) or
	// Polyphonic switch [red LED below] (Arturia)
	//   When set, instrument is in polyphonic mode with one oscillator per key
    clipg(x) = fxg(vgroup("[9] Soft Clip", x));
	// Soft Clipping switch [red LED above]
  kg(x) = synthg(hgroup("[1] Keyboard Group", x)); // Keyboard was 3 1/2 octaves
    ws(x) = kg(vgroup("[0] Wheels and Switches", x));
      s1g(x) = ws(hgroup("[0] Jacks and Rockers", x));
        jg(x) = s1g(vgroup("[0] MiniJacks",x));
        gdlg(x) = s1g(vgroup("[1] Glide/Decay/Legato Enables",x)); // Arturia
	// Glide Hrocker (see original Button version below)
	// Decay Hrocker (see original Button version below) => Sets Release (R) of ADSR to either 0 or Decay (R)
	// Legato Hrocker (not in original)
      s2g(x) = ws(hgroup("[1] [tooltip:Wheels+]", x));
        bg(x) = s2g(vgroup("[0] [tooltip:Bend Enable and Range]", x));
        wg(x) = s2g(hgroup("[1] [tooltip:Bend and Mod Wheels]", x));
	// Using Glide/Decay/Legato enables above following Arturia:
	//   dg(x) = s2g(hgroup("[2] Glide and Decay momentary pushbuttons", x));
	//   Glide Button injects portamento as set by Glide knob
	//   Decay Button uses decay of Loudness Contour (else 0)
    keys(x) = kg(hgroup("[1] [tooltip:Keys]", x));
      gg(x) = keys(hgroup("[0] [tooltip: Gates]",x));
      // leave slot 1 open for sustain (below)
`;
const SIMPLESYNTH_DSP = `import("stdfaust.lib");

// A minimal subtractive-synth voice: a sawtooth oscillator through a
// resonant low-pass filter, shaped by an ADSR envelope.
// freq / gain / gate are the MIDI note interface; cutoff / resonance
// become tweakable channel parameters (mapped to MIDI CC).


freq = hslider("freq", 440, 20, 20000, 0.01);
gain = hslider("gain", 0.5, 0, 1, 0.01);
gate = button("gate");

cutoff    = hslider("cutoff", 2000, 50, 8000, 1);
resonance = hslider("resonance", 2, 0.7, 25, 0.01);

env = en.adsr(0.01, 0.2, 0.7, 0.3, gate);

process = os.sawtooth(freq) : fi.resonlp(cutoff, resonance, 1) : *(env * gain);
ch = library("chorus.dsp");
effect = ch.chorus_mono(ch.dmax, ch.curdel, ch.rate, ch.sigma, ch.do2, ch.voices);

`;


// --- in-page helpers -------------------------------------------------------

const setSynthEditorContent = (page, content) => page.evaluate((text) => {
    document.querySelector('app-javascriptmusic').shadowRoot
        .querySelector('#assemblyscripteditor .CodeMirror').CodeMirror.setValue(text);
}, content);

const setSongEditorContent = (page, content) => page.evaluate((text) => {
    document.querySelector('app-javascriptmusic').shadowRoot
        .querySelector('#editor .CodeMirror').CodeMirror.setValue(text);
}, content);

const setFaustEditorContent = (page, content) => page.evaluate((text) => {
    document.querySelector('app-javascriptmusic').shadowRoot
        .querySelector('#faustcodemirror .CodeMirror').CodeMirror.setValue(text);
}, content);

const getFaustEditorContent = (page) => page.evaluate(() => {
    return document.querySelector('app-javascriptmusic').shadowRoot
        .querySelector('#faustcodemirror .CodeMirror').CodeMirror.getValue();
});

const getFaustSaveStatus = (page) => page.evaluate(() => {
    return document.querySelector('app-javascriptmusic').shadowRoot
        .getElementById('faustsavestatus').textContent;
});

const getDropdownOptions = (page) => page.evaluate(() => {
    const sel = document.querySelector('app-javascriptmusic').shadowRoot
        .getElementById('faustfileselect');
    return Array.from(sel.options).map(o => o.textContent);
});

// Click "New file…" then drive the modalPrompt that pops up: the modal is
// appended to <html> as a <common-modal> with the input inside its shadow root.
const newFaustFile = async (page, name) => {
    await page.locator('#faustnewfilebutton').click();
    const input = page.locator('common-modal').locator('#modal-prompt-input');
    await input.waitFor({ state: 'visible' });
    await input.fill(name);
    await input.press('Enter');
};

// --- spec ------------------------------------------------------------------

test.describe('Faust editor — create, transpile, import, compile', () => {
    test.afterEach(async ({ page }) => {
        await clearOPFS(page, repoName);
    });

    test('faust toggle reveals the editor with empty dropdown when no .dsp files exist', async ({ page }) => {
        page.on('console', (m) => console.log('[browser]', m.type(), m.text()));
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await pushBaseline(page, repoName, '// empty\n');
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        // Toggle on
        const toggle = page.locator('#fausteditortogglecheckbox');
        await toggle.check();

        const editor = page.locator('#fausteditor');
        await expect(editor).toBeVisible();

        // Dropdown placeholder appears (no .dsp files yet)
        // refreshFaustFileList() is fire-and-forget post-init — give it a moment.
        await expect(page.locator('#faustfileselect option')).toHaveText(['(no .dsp files yet)'], { timeout: 15000 });
    });

    test('New file creates faust/<name>.dsp seeded with stdfaust template and opens editor', async ({ page }) => {
        page.on('console', (m) => {
            if (m.type() === 'error' || m.type() === 'warning') console.log('[browser]', m.type(), m.text());
        });
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await pushBaseline(page, repoName, '// empty\n');
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        await page.locator('#fausteditortogglecheckbox').check();

        await newFaustFile(page, 'phase3test');

        // Editor visible with the seeded template
        await expect(page.locator('#fausteditor')).toBeVisible();
        await page.waitForFunction(() => {
            const cm = document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('#faustcodemirror .CodeMirror');
            return cm && cm.CodeMirror.getValue().includes('import("stdfaust.lib")');
        }, { timeout: 10000 });

        // The seeded source contains the stdfaust template
        const inEditor = await getFaustEditorContent(page);
        expect(inEditor).toContain('import("stdfaust.lib")');

        // Dropdown lists the new .dsp (proves listfiles() saw the write)
        const opts = await getDropdownOptions(page);
        expect(opts).toEqual(['phase3test.dsp']);
    });

    test('save song transpiles .dsp → .ts and the AS compiler picks it up', async ({ page }) => {
        // Surface page console output for debugging
        page.on('console', (m) => console.log('[browser]', m.type(), m.text()));
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));

        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await pushBaseline(page, repoName, SONG_SOURCE);
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        // 1. Create a fresh .dsp via the Faust editor
        await page.locator('#fausteditortogglecheckbox').check();
        await newFaustFile(page, 'phase3saw');
        await page.waitForFunction(() => {
            const cm = document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('#faustcodemirror .CodeMirror');
            return cm && cm.CodeMirror.getValue().length > 0;
        }, { timeout: 10000 });

        // 2. Replace the seeded stub with our known DSP
        await setFaustEditorContent(page, FAUST_SOURCE);

        // 3. Wire the synth editor to import from the not-yet-transpiled module
        await setSynthEditorContent(page, SYNTH_MIX_SOURCE('phase3saw'));
        await setSongEditorContent(page, SONG_SOURCE);

        // 4. Save: this triggers saveFaustIfChanged → write .dsp + .ts → compile
        await page.evaluate(() => { window.WASM_SYNTH_BYTES = null; });
        await page.locator('#savesongbutton').click();

        // 5. Wait for the transpile-then-compile pipeline to finish.
        //    The status surfaces a ready-to-paste import line.
        await page.waitForFunction(() => {
            const status = document.querySelector('app-javascriptmusic').shadowRoot
                .getElementById('faustsavestatus').textContent || '';
            return /import \{ Phase3saw \} from '\.\.\/faust\/phase3saw';/.test(status);
        }, { timeout: 60000 });

        // 6. The AS compiler produced a wasm — proves faust/*.ts was
        //    transpiled, written, picked up by the compiler worker, and
        //    successfully resolved as `import { ... } from '../faust/phase3saw';`.
        await page.waitForFunction(() => window.WASM_SYNTH_BYTES != null,
            { timeout: 60000 });
        const wasmLength = await page.evaluate(() =>
            window.WASM_SYNTH_BYTES ? window.WASM_SYNTH_BYTES.length : 0);
        expect(wasmLength).toBeGreaterThan(1000);

        // 7. Auto-recompile on Faust-only edit: change *only* the .dsp
        //    (synth source unchanged) and save again. The worker now
        //    fingerprints the injected faust sources, so the wasm bytes
        //    must change between the two compiles.
        const firstWasmLen = wasmLength;
        await page.evaluate(() => { window.WASM_SYNTH_BYTES = null; });
        await setFaustEditorContent(page,
            FAUST_SOURCE.replace('os.sawtooth(freq)', 'os.square(freq)'));
        await page.locator('#savesongbutton').click();
        await page.waitForFunction(() => window.WASM_SYNTH_BYTES != null,
            { timeout: 60000 });
        const secondWasmLen = await page.evaluate(() =>
            window.WASM_SYNTH_BYTES ? window.WASM_SYNTH_BYTES.length : 0);
        expect(secondWasmLen).toBeGreaterThan(1000);
        // Different DSP → different generated AS → different wasm size (the
        // sawtooth and square families compile to different code paths).
        expect(secondWasmLen).not.toBe(firstWasmLen);
    });

    test('studio-agent write_faust refreshes the editor showing that file (no file-switch needed)', async ({ page }) => {
        // Regression: the agent's write_faust wrote straight to OPFS and only
        // refreshed the dropdown, so overwriting the file already on screen
        // left stale content in the editor until the user switched files and
        // back. write_faust must now reflect the new bytes immediately.
        page.on('console', (m) => {
            if (m.type() === 'error' || m.type() === 'warning') console.log('[browser]', m.type(), m.text());
        });
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await pushBaseline(page, repoName, '// empty\n');
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        // Open agentrefresh.dsp in the editor (seeded with the stdfaust template).
        await page.locator('#fausteditortogglecheckbox').check();
        await newFaustFile(page, 'agentrefresh');
        await page.waitForFunction(() => {
            const cm = document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('#faustcodemirror .CodeMirror');
            return cm && cm.CodeMirror.getValue().includes('import("stdfaust.lib")');
        }, { timeout: 10000 });

        // Agent overwrites the SAME file that is currently on screen.
        const result = await page.evaluate((source) =>
            window.studioAgentRunTool('write_faust', { path: 'agentrefresh', source }),
            FAUST_SOURCE);
        expect(String(result)).toContain('transpiled OK');

        // The editor shows the agent's content without any file switching.
        const inEditor = await getFaustEditorContent(page);
        expect(inEditor).toBe(FAUST_SOURCE);
        // ...and the dropdown selection still points at the same file.
        const opts = await getDropdownOptions(page);
        expect(opts).toEqual(['agentrefresh.dsp']);
    });

    test('sub-folder layout: faust/<dir>/<dir>/main.dsp transpile + import works', async ({ page }) => {
        // Mirrors the user's vscode-prepared repo shape: a Faust file
        // nested several directories deep (e.g. faust/mysong/dsp/main.dsp).
        // Verifies that:
        //   * "New file" accepts slash-separated paths
        //   * the worker injects the transpiled .ts under faust/<full-rel-path>.ts
        //     (preserving sub-folders, not flattening to basename)
        //   * the resulting wasm compiles when the synth imports via the
        //     sub-folder path
        page.on('console', (m) => {
            if (m.type() === 'error' || m.type() === 'warning') console.log('[browser]', m.type(), m.text());
        });
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));

        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await pushBaseline(page, repoName, SONG_SOURCE);
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);

        await page.locator('#fausteditortogglecheckbox').check();
        await newFaustFile(page, 'mysong/dsp/main');
        await page.waitForFunction(() => {
            const cm = document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('#faustcodemirror .CodeMirror');
            return cm && cm.CodeMirror.getValue().length > 0;
        }, { timeout: 10000 });
        await setFaustEditorContent(page, FAUST_SOURCE);

        const synthSrc = `// uses midichannels (route via midi.mix)
import { initializeMidiSynth, postprocess } from '../faust/mysong/dsp/main';
export { initializeMidiSynth, postprocess };
`;
        await setSynthEditorContent(page, synthSrc);
        await setSongEditorContent(page, SONG_SOURCE);

        await page.evaluate(() => { window.WASM_SYNTH_BYTES = null; });
        await page.locator('#savesongbutton').click();

        // Status surfaces the exact import line for the sub-folder path.
        await page.waitForFunction(() => {
            const status = document.querySelector('app-javascriptmusic').shadowRoot
                .getElementById('faustsavestatus').textContent || '';
            return /import \{ Main \} from '\.\.\/faust\/mysong\/dsp\/main';/.test(status);
        }, { timeout: 60000 });

        // Wasm produced — proves the worker injected
        // assemblyscriptsynthsources['faust/mysong/dsp/main.ts'] correctly.
        await page.waitForFunction(() => window.WASM_SYNTH_BYTES != null,
            { timeout: 60000 });
        const wasmLen = await page.evaluate(() =>
            window.WASM_SYNTH_BYTES ? window.WASM_SYNTH_BYTES.length : 0);
        expect(wasmLen).toBeGreaterThan(1000);
    });

    // The user's real scenario: a Simple Synth with a chorus send effect that
    // pulls in `library("chorus.dsp")`, which itself `import`s stdfaust.lib and
    // a sibling `layout2.dsp`. Encodes two regressions:
    //   1. Save must persist the .dsp source even when transpilation fails
    //      (e.g. a sibling library isn't in place yet) — otherwise edits are
    //      silently lost on the next file switch ("it reverts when I save").
    //   2. faust-rs sibling resolution: a library resolved from a sibling must
    //      itself resolve stdfaust + further siblings, so the whole
    //      simplesynth + chorus + layout2 chain transpiles.
    test('chorus effect: source survives a failed transpile, then the full simplesynth+chorus+layout2 chain compiles', async ({ page }) => {
        page.on('console', (m) => { if (m.type() === 'error') console.log('[browser]', m.text()); });
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        await page.goto('http://localhost:8080');
        await setupServiceWorker(page);
        await pushBaseline(page, repoName, SONG_SOURCE);
        await page.goto(`http://localhost:8080/?gitrepo=${NEAR_REPO_CONTRACT}`);
        await waitForAppReady(page);
        await page.locator('#fausteditortogglecheckbox').check();

        // A write (create/save) triggers a delayed list refresh that can reset
        // the active file. Let pending refreshes settle before the next step.
        const settle = () => page.waitForTimeout(700);
        // Select a file via the dropdown and wait until its on-disk content
        // has actually loaded (sentinel guards against false positives and
        // overlapping loads). Reads only — does not trigger a refresh — so the
        // active file stays put through the save that follows.
        const selectFaust = async (filename) => {
            await page.evaluate((f) => {
                const root = document.querySelector('app-javascriptmusic').shadowRoot;
                root.querySelector('#faustcodemirror .CodeMirror').CodeMirror.setValue('__LOADING__');
                const sel = root.getElementById('faustfileselect');
                sel.value = 'faust/' + f;
                sel.dispatchEvent(new Event('change'));
            }, filename);
            await page.waitForFunction(() => {
                const cm = document.querySelector('app-javascriptmusic').shadowRoot
                    .querySelector('#faustcodemirror .CodeMirror');
                return cm && cm.CodeMirror.getValue() !== '__LOADING__';
            }, { timeout: 10000 });
        };
        const editorContent = () => page.evaluate(() =>
            document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('#faustcodemirror .CodeMirror').CodeMirror.getValue());
        // Set the editor to `content` and save the active file via the exposed
        // hook, isolating the faust transpile from the song-compile pipeline.
        const setContentAndSave = (content) => page.evaluate(async (c) => {
            document.querySelector('app-javascriptmusic').shadowRoot
                .querySelector('#faustcodemirror .CodeMirror').CodeMirror.setValue(c);
            try { await window.__saveFaustIfChanged(); return { ok: true }; }
            catch (e) { return { ok: false, msg: String((e && e.message) || e) }; }
        }, content);

        // Create the three files (seeded stubs); settle after each write.
        await newFaustFile(page, 'chorus');     await settle();
        await newFaustFile(page, 'layout2');    await settle();
        await newFaustFile(page, 'simplesynth'); await settle();

        // --- Phase 1: source survives a failed transpile ------------------
        // chorus.dsp is still the stub (no chorus_mono), so saving the chorus-
        // effect simplesynth MUST fail to transpile.
        await selectFaust('simplesynth.dsp');
        const firstSave = await setContentAndSave(SIMPLESYNTH_DSP);
        expect(firstSave.ok).toBe(false);
        await settle();

        // The regression: switch away and back; the chorus-effect source must
        // still be there, not reverted to the seeded stub.
        await selectFaust('chorus.dsp');
        await selectFaust('simplesynth.dsp');
        expect(await editorContent()).toContain('ch.chorus_mono');

        // --- Phase 2: put the real chorus + layout2 in place --------------
        await selectFaust('chorus.dsp');
        await setContentAndSave(CHORUS_DSP);     // may fail until layout2 saved; source persists
        await settle();
        await selectFaust('layout2.dsp');
        await setContentAndSave(LAYOUT2_DSP);    // no process → transpile fails; source persists
        await settle();

        // --- Phase 3: the whole chain transpiles --------------------------
        await selectFaust('simplesynth.dsp');
        const finalSave = await setContentAndSave(SIMPLESYNTH_DSP);
        expect(finalSave.ok).toBe(true);
        const status = await getFaustSaveStatus(page);
        expect(status).toContain("import { Simplesynth } from '../faust/simplesynth';");
    });
});
