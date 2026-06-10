#!/usr/bin/env node
/*
 * Visualizer shader test harness.
 *
 * Compiles a WebAssembly-Music fragment shader in a headless WebGL context and
 * renders still frames to PNG, with the same uniforms the app provides. This is
 * the feedback loop for developing shaders without a human (or a GPU) in the
 * loop: catch GLSL compile errors instantly, then eyeball / measure rendered
 * frames at chosen times and "music energy".
 *
 * Requires Playwright, which is a dev-dependency of wasmaudioworklet — so run it
 * from there (that is where node_modules/playwright resolves):
 *
 *   cd wasmaudioworklet
 *   node ../tools/shadertest/render.mjs <shader.glsl> [options]
 *
 * Options:
 *   --time <s>            time uniform, seconds (default 4)
 *   --frames <t1,t2,...>  render several frames at these times (overrides --time)
 *   --energy <0..1>       fake "music energy": fills a band of note states so
 *                         note-reactive shaders light up (default 0.5)
 *   --size <WxH>          framebuffer size (default 900x506)
 *   --out <file.png>      output path (single frame). Default: /tmp/<name>_t<time>.png
 *   --outdir <dir>        output dir for --frames (default /tmp)
 *   --compile-only        just compile-check; print OK/FAIL and exit
 *
 * Exit code is non-zero if the shader fails to compile, so it doubles as a
 * pre-commit / CI smoke check.
 *
 * Uniform contract (what the app binds — keep shaders compatible with these):
 *   uniform vec2  resolution;              // framebuffer pixels
 *   uniform float time;                    // seconds since the shader started
 *   uniform float targetNoteStates[128];   // per MIDI note, -1..1, where -1 = "no note"
 *                                          //   (a sounding note ~ velocity/127*2-1)
 *   uniform float smoothedNoteStates[128]; // JS-smoothed view: fast attack, slow release
 *   uniform sampler2D uSampler;            // active image/video frame (image shaders)
 *   uniform sampler2D uSamplerPrev;        // previous frame (crossfade pair)
 *   uniform float uMix;                    // 0..1 crossfade; pinned to 1 outside transitions
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

// Playwright is a dev-dependency of wasmaudioworklet; resolve it from there no
// matter where this script is run from.
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const waw = path.resolve(scriptDir, '../../wasmaudioworklet');
let chromium;
try {
  chromium = createRequire(path.join(waw, 'package.json'))('playwright').chromium;
} catch (e) {
  try { ({ chromium } = await import('playwright')); }
  catch (e2) {
    console.error('Could not load playwright. Install deps once:  (cd wasmaudioworklet && npm install)');
    process.exit(2);
  }
}

function parseArgs(argv) {
  const a = { time: 4, energy: 0.5, size: '900x506', frames: null, out: null, outdir: '/tmp', compileOnly: false };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--time') a.time = parseFloat(argv[++i]);
    else if (k === '--energy') a.energy = parseFloat(argv[++i]);
    else if (k === '--size') a.size = argv[++i];
    else if (k === '--frames') a.frames = argv[++i].split(',').map(Number);
    else if (k === '--out') a.out = argv[++i];
    else if (k === '--outdir') a.outdir = argv[++i];
    else if (k === '--compile-only') a.compileOnly = true;
    else rest.push(k);
  }
  a.shader = rest[0];
  return a;
}

const args = parseArgs(process.argv.slice(2));
if (!args.shader) {
  console.error('usage: node ../tools/shadertest/render.mjs <shader.glsl> [--time s] [--frames t1,t2] [--energy 0..1] [--size WxH] [--out f.png] [--compile-only]');
  process.exit(2);
}
const src = fs.readFileSync(args.shader, 'utf8');
const [W, H] = args.size.split('x').map(Number);
const name = path.basename(args.shader).replace(/\.[^.]+$/, '');

const browser = await chromium.launch();
const page = await browser.newPage();

// Headless compile check first — clear, fast failure with the GLSL info log.
const compile = await page.evaluate((src) => {
  const gl = document.createElement('canvas').getContext('webgl');
  const sh = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? 'OK' : gl.getShaderInfoLog(sh);
}, src);
if (compile !== 'OK') {
  console.error(`COMPILE FAIL (${args.shader}):\n${compile}`);
  await browser.close();
  process.exit(1);
}
console.log(`COMPILE OK  ${args.shader}`);
if (args.compileOnly) { await browser.close(); process.exit(0); }

async function render(time) {
  const r = await page.evaluate(({ src, W, H, time, energy }) => {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const gl = cv.getContext('webgl', { preserveDrawingBuffer: true });
    const mk = (type, s) => { const o = gl.createShader(type); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const vs = mk(gl.VERTEX_SHADER, 'attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}');
    const fs = mk(gl.FRAGMENT_SHADER, src);
    const p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p); gl.useProgram(p);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(p, 'a_position');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const set2 = (n, x, y) => { const l = gl.getUniformLocation(p, n); if (l) gl.uniform2f(l, x, y); };
    const set1 = (n, x) => { const l = gl.getUniformLocation(p, n); if (l) gl.uniform1f(l, x); };
    const setv = (n, arr) => { const l = gl.getUniformLocation(p, n); if (l) gl.uniform1fv(l, arr); };
    set2('resolution', W, H);
    set1('time', time);
    set1('uMix', 1.0);
    // note states: -1 = silent; fill a band to 'energy' to simulate sounding notes.
    const z = new Float32Array(128).fill(-1);
    for (let i = 20; i < 20 + Math.floor(energy * 60); i++) z[i] = 0.9;
    setv('targetNoteStates', z);
    setv('smoothedNoteStates', z);
    // bind a 1x1 texture for image shaders so uSampler/uSamplerPrev don't error.
    for (let u = 0; u < 2; u++) {
      const name = u === 0 ? 'uSampler' : 'uSamplerPrev';
      const l = gl.getUniformLocation(p, name); if (!l) continue;
      const tex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + u); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([90, 90, 90, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(l, u);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    // simple "did it draw anything" metric: fraction of non-near-black pixels.
    const px = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
    let lit = 0; for (let i = 0; i < px.length; i += 4) if (px[i] + px[i + 1] + px[i + 2] > 24) lit++;
    return { url: cv.toDataURL('image/png'), litPct: Math.round((100 * lit) / (W * H)) };
  }, { src, W, H, time, energy: args.energy });
  return r;
}

const times = args.frames ?? [args.time];
for (const tm of times) {
  const r = await render(tm);
  const out = args.frames
    ? path.join(args.outdir, `${name}_t${tm}.png`)
    : (args.out ?? path.join(args.outdir, `${name}_t${tm}.png`));
  fs.writeFileSync(out, Buffer.from(r.url.split(',')[1], 'base64'));
  console.log(`  t=${tm}s  energy=${args.energy}  lit=${r.litPct}%  -> ${out}`);
}

await browser.close();
