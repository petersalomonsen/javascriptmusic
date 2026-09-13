import { test, expect } from '@playwright/test';
import { waitForAppReady, waitForStudioAgentTools, clearOPFS, specRepo } from './near-git-helpers.js';

// "Shader video with sound": one WebM with a VP9 video track and an Opus
// audio track, both from the same event list. The save-file picker needs a
// user gesture and a dialog, so the test hands the app an OPFS file handle
// instead, then reads the file back: the audio must decode to the song's
// length with sound in it, and the video track must have the same length.
//
// Its own local repo, so no NEAR sandbox is needed.
const REPO = specRepo('video-export');

// Two bars at 120 BPM = 4 s: a note per beat on the default synth.
const SONG = `setBPM(120);
await createTrack(0).steps(1, [ c4, e4, g4, c5, c4, e4, g4, c5 ]);
`;
const SHADER = `precision highp float;
uniform vec2 resolution;
uniform float time;
void main() { gl_FragColor = vec4(gl_FragCoord.xy / resolution, 0.5 + 0.5 * sin(time), 1.0); }
`;

test.describe('video export with sound (local repo)', () => {
    test.afterEach(async ({ page }) => { await clearOPFS(page, REPO); });

    test('one WebM carries a VP9 video track and an Opus audio track of the song', async ({ page }) => {
        page.on('pageerror', (e) => console.log('[browser-error]', e.message));
        await page.addInitScript(() => {
            // what the export would ask the user for: a file to write to
            window.showSaveFilePicker = async () => (await navigator.storage.getDirectory()).getFileHandle('export-test.webm', { create: true });
        });
        await page.goto(`http://localhost:8080/?gitrepo=${REPO}`);
        await waitForAppReady(page);
        await waitForStudioAgentTools(page);

        const run = (name, args) => page.evaluate(({ name, args }) => window.studioAgentRunTool(name, args), { name, args });
        expect(await run('set_song', { source: SONG })).toContain('song updated');
        expect(await run('set_shader', { source: SHADER })).toContain('shader updated');
        expect(String(await run('compile', {}))).toContain('compiled OK');

        // the export: render audio offline at 48 kHz, encode frames, mux — under a minute for 4 s
        await page.evaluate(() => window.compileSong('videoaudio'));

        const result = await page.evaluate(async () => {
            const root = await navigator.storage.getDirectory();
            const file = await (await root.getFileHandle('export-test.webm')).getFile();
            const bytes = await file.arrayBuffer();
            // audio: the browser demuxes WebM/Opus for decodeAudioData
            const audio = await new AudioContext().decodeAudioData(bytes.slice(0));
            let peak = 0;
            const l = audio.getChannelData(0);
            for (let i = 0; i < l.length; i++) peak = Math.max(peak, Math.abs(l[i]));
            // video: a <video> element reports the container's duration and the frame size
            const video = document.createElement('video');
            video.src = URL.createObjectURL(new Blob([bytes], { type: 'video/webm' }));
            await new Promise((ok, err) => { video.onloadedmetadata = ok; video.onerror = () => err(new Error('video failed to load')); });
            return { size: file.size, audioSeconds: audio.duration, channels: audio.numberOfChannels, sampleRate: audio.sampleRate, peak,
                videoSeconds: video.duration, width: video.videoWidth, height: video.videoHeight };
        });
        console.log('export:', JSON.stringify(result));
        expect(result.size).toBeGreaterThan(50_000);
        expect(result.channels).toBe(2);
        expect(result.audioSeconds).toBeGreaterThan(3.9);
        expect(result.audioSeconds).toBeLessThan(4.3);
        expect(result.peak).toBeGreaterThan(0.05);           // there is sound in it
        expect(result.width).toBe(1280);
        expect(result.height).toBe(720);
        expect(Math.abs(result.videoSeconds - result.audioSeconds)).toBeLessThan(0.25);   // the two tracks agree
    });
});
