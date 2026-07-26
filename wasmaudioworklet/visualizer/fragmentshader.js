import { setProgressbarValue } from '../common/ui/progress-bar.js';
import { getCurrentTimeSeconds, setUseDefaultVisualizer, getUseDefaultVisualizer, getTargetNoteStates, getSynthState, clearPositions } from './defaultvisualizer.js';
import { setGetCurrentTimeFunction, visualizeSong } from './midieventlistvisualizer.js';
import { getActiveVideo, getActiveText } from './videoscheduler.js';
import { getActiveVisualParams } from './visualparams.js';

const vertexShaderSrc = `            
attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0, 1);
}
`;

let exporting = false;
let canvas;

// Parallel smoothed view of getTargetNoteStates() for shaders that want
// gradual transitions instead of the raw on/off-with-velocity signal.
// Fast attack, slow release — kept frame-rate-independent enough for 60Hz
// rAF and the fixed 30fps export loop.
const smoothedNoteStates = new Float32Array(128).fill(-1);
const SMOOTH_RELEASE_PER_FRAME = 0.04; // ~25 frames to fall fully → ~0.4s at 60fps
function computeSmoothedNoteStates() {
    const raw = getTargetNoteStates();
    for (let i = 0; i < 128; i++) {
        const r = raw[i];
        const s = smoothedNoteStates[i];
        if (r >= s) {
            smoothedNoteStates[i] = r; // attack: snap to target
        } else {
            smoothedNoteStates[i] = Math.max(r, s - SMOOTH_RELEASE_PER_FRAME);
        }
    }
    return smoothedNoteStates;
}

function initTexture(gl, fillPixel = [0, 0, 0, 0]) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because video has to be download over the internet
    // they might take a moment until it's ready so
    // put a single pixel in the texture so we can
    // use it immediately. It is fully TRANSPARENT: shaders composite these
    // layers by alpha, so "nothing scheduled yet" (or a song with no images
    // at all) must paint nothing. An opaque placeholder here covers the whole
    // frame in shaders that mix by card.a — a flat screen of placeholder
    // colour hiding everything the shader draws.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array(fillPixel);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    // Turn off mips and set  wrapping to clamp to edge so it
    // will work regardless of the dimensions of the video.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    return texture;
}

function updateTexture(gl, texture, video) {
    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, video);
}

// Crossfade duration when the active video changes (image-to-image swap).
// Videos keep their per-frame texture updates and don't transition.
const TRANSITION_DURATION_SECONDS = 1.5;

// Per-program state for the active/previous textures and the transition.
// Ping-pong: textures[0] is "current" (bound to TEXTURE0/uSampler),
// textures[1] is "previous" (bound to TEXTURE1/uSamplerPrev). On switch
// we swap the array and upload the new image into textures[0]; the array
// element formerly at [0] becomes [1] and keeps its prior image.
function createMediaState(gl) {
    return {
        textures: [initTexture(gl), initTexture(gl)],
        lastActiveVideo: null,
        transitionStart: -1,
    };
}

function updateMediaStateAndGetMix(gl, state, currentTimeSeconds) {
    const currentVideo = getActiveVideo(currentTimeSeconds * 1000);
    const isImage = currentVideo && currentVideo.tagName === 'IMG';

    if (currentVideo !== state.lastActiveVideo) {
        // Swap so textures[0] becomes the slot we'll write the new image to,
        // textures[1] holds whatever was previously displayed.
        state.textures.reverse();
        if (currentVideo) {
            updateTexture(gl, state.textures[0], currentVideo);
        }
        // Only crossfade between two real frames — null → image (first show)
        // snaps in.
        if (state.lastActiveVideo !== null && currentVideo !== null) {
            state.transitionStart = currentTimeSeconds;
        }
        state.lastActiveVideo = currentVideo;
    } else if (currentVideo && !isImage) {
        // Video frame advances each tick; image content is static.
        updateTexture(gl, state.textures[0], currentVideo);
    }

    let mix = 1.0;
    if (state.transitionStart >= 0) {
        const t = (currentTimeSeconds - state.transitionStart) / TRANSITION_DURATION_SECONDS;
        if (t >= 1) {
            state.transitionStart = -1;
            mix = 1.0;
        } else {
            mix = t;
        }
    }
    return mix;
}

function bindMediaTextures(gl, state, samplerLoc, samplerPrevLoc, mixLoc, mix) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, state.textures[0]);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, state.textures[1]);
    if (samplerLoc) gl.uniform1i(samplerLoc, 0);
    if (samplerPrevLoc) gl.uniform1i(samplerPrevLoc, 1);
    if (mixLoc) gl.uniform1f(mixLoc, mix);
}

// --- Text layer -------------------------------------------------------------
// showText() in the song schedules text images on their own texture pair
// (units 2 and 3), so text composites over whatever the shader draws instead
// of competing for uSampler. Unlike the media crossfade, the fade is timed
// from the scheduled song time and its duration comes from the song — which
// makes it deterministic when seeking or exporting video.

function createTextState(gl) {
    return {
        textures: [initTexture(gl), initTexture(gl)],
        lastImage: null,
        shownEntry: null,
    };
}

function updateTextStateAndGetMix(gl, state, currentTimeSeconds) {
    const entry = getActiveText(currentTimeSeconds * 1000);
    const image = entry && entry.video ? entry.video.imageElement : null;
    // Skip until decoded — the previous text stays on screen rather than
    // flashing away while the new one loads.
    const ready = image && image.complete && image.naturalWidth > 0 ? image : null;

    if (ready && ready !== state.lastImage) {
        // Ping-pong: the outgoing text becomes textures[1] (uTextPrev).
        state.textures.reverse();
        updateTexture(gl, state.textures[0], ready);
        state.lastImage = ready;
        state.shownEntry = entry;
    } else if (!entry && state.lastImage) {
        // Seeked (or looped) back past the first showText — clear the layer
        // instead of leaving the last text of the previous pass on screen.
        gl.bindTexture(gl.TEXTURE_2D, state.textures[0]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 0, 0]));
        state.lastImage = null;
        state.shownEntry = null;
    }

    const shown = state.shownEntry;
    if (!shown || !(shown.fade > 0)) {
        return 1.0;
    }
    const elapsed = currentTimeSeconds - shown.startTime / 1000;
    return Math.min(1, Math.max(0, elapsed / shown.fade));
}

function bindTextTextures(gl, state, textLoc, textPrevLoc, textMixLoc, mix) {
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, state.textures[0]);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, state.textures[1]);
    if (textLoc) gl.uniform1i(textLoc, 2);
    if (textPrevLoc) gl.uniform1i(textPrevLoc, 3);
    if (textMixLoc) gl.uniform1f(textMixLoc, mix);
}

// Named floats the song scheduled with setVisual(). Locations are resolved
// lazily and cached per program — a name the shader doesn't declare resolves
// to null once and is skipped from then on.
function applyVisualParams(ctx, currentTimeSeconds) {
    const gl = ctx.glContext;
    getActiveVisualParams(currentTimeSeconds * 1000).forEach((value, name) => {
        let location = ctx.visualParamLocations.get(name);
        if (location === undefined) {
            location = gl.getUniformLocation(ctx.program, name);
            ctx.visualParamLocations.set(name, location);
        }
        if (location) {
            gl.uniform1f(location, value);
        }
    });
}

function configureGLContext(source) {
    const glContext = canvas.getContext("webgl");

    glContext.viewport(0, 0, glContext.drawingBufferWidth, glContext.drawingBufferHeight);
    glContext.clearColor(0.0, 0.0, 0.0, 1.0);
    glContext.clear(glContext.COLOR_BUFFER_BIT);

    const mediaState = createMediaState(glContext);

    const vertexShader = glContext.createShader(glContext.VERTEX_SHADER);
    glContext.shaderSource(vertexShader, vertexShaderSrc);
    glContext.compileShader(vertexShader);

    const fragmentShader = glContext.createShader(glContext.FRAGMENT_SHADER);
    glContext.shaderSource(fragmentShader, source);
    glContext.compileShader(fragmentShader);

    const compiled = glContext.getShaderParameter(fragmentShader, glContext.COMPILE_STATUS);
    console.log('Shader compiled successfully: ' + compiled);
    if (!compiled) {
        const compilationLog = glContext.getShaderInfoLog(fragmentShader);
        throw new Error(compilationLog);
    }
    const program = glContext.createProgram();
    glContext.attachShader(program, vertexShader);
    glContext.attachShader(program, fragmentShader);
    glContext.linkProgram(program);
    glContext.detachShader(program, vertexShader);
    glContext.detachShader(program, fragmentShader);
    glContext.deleteShader(vertexShader);
    glContext.deleteShader(fragmentShader);
    if (!glContext.getProgramParameter(program, glContext.LINK_STATUS)) {
        const linkErrLog = glContext.getProgramInfoLog(program);
        throw new Error(linkErrLog);
    }

    glContext.enableVertexAttribArray(0);
    const buffer = glContext.createBuffer();
    glContext.bindBuffer(glContext.ARRAY_BUFFER, buffer);
    glContext.bufferData(
        glContext.ARRAY_BUFFER,
        new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0]),
        glContext.STATIC_DRAW
    );

    glContext.useProgram(program);

    const resolutionUniformLocation = glContext.getUniformLocation(program, "resolution");
    glContext.uniform2f(resolutionUniformLocation, glContext.canvas.width, glContext.canvas.height);
    const timeUniformLocation = glContext.getUniformLocation(program, "time");
    glContext.uniform1f(timeUniformLocation, 0.0);
    const targetNoteStatesUniformLocation = glContext.getUniformLocation(program, "targetNoteStates");
    glContext.uniform1fv(targetNoteStatesUniformLocation, getTargetNoteStates());
    // Null when the shader doesn't declare smoothedNoteStates — uniform1fv
    // is a no-op against a null location.
    const smoothedNoteStatesUniformLocation = glContext.getUniformLocation(program, "smoothedNoteStates");
    glContext.uniform1fv(smoothedNoteStatesUniformLocation, computeSmoothedNoteStates());
    // Merged MIDI controller values (0..1), relayed from the wasm synth. Null
    // Generic synth state (f32 array), relayed from the wasm. The song's shader
    // declares `uniform float synthState[N]`; null (no-op) for shaders that don't.
    const synthStateUniformLocation = glContext.getUniformLocation(program, "synthState");
    glContext.uniform1fv(synthStateUniformLocation, getSynthState());

    // uSampler / uSamplerPrev / uMix — null if the shader doesn't declare them
    // (single-sampler shaders just see uSampler bound to TEXTURE0 as before).
    const samplerUniformLocation = glContext.getUniformLocation(program, "uSampler");
    const samplerPrevUniformLocation = glContext.getUniformLocation(program, "uSamplerPrev");
    const mixUniformLocation = glContext.getUniformLocation(program, "uMix");
    bindMediaTextures(glContext, mediaState,
        samplerUniformLocation, samplerPrevUniformLocation, mixUniformLocation, 1.0);

    // uText / uTextPrev / uTextMix — the showText() layer, same null-safe deal.
    const textState = createTextState(glContext);
    const textUniformLocation = glContext.getUniformLocation(program, "uText");
    const textPrevUniformLocation = glContext.getUniformLocation(program, "uTextPrev");
    const textMixUniformLocation = glContext.getUniformLocation(program, "uTextMix");
    bindTextTextures(glContext, textState,
        textUniformLocation, textPrevUniformLocation, textMixUniformLocation, 1.0);

    const positionLocation = glContext.getAttribLocation(program, "a_position");
    glContext.enableVertexAttribArray(positionLocation);
    glContext.vertexAttribPointer(positionLocation, 2, glContext.FLOAT, false, 0, 0);

    glContext.drawArrays(glContext.TRIANGLES, 0, 6);

    return {
        program,
        glContext,
        timeUniformLocation,
        targetNoteStatesUniformLocation,
        smoothedNoteStatesUniformLocation,
        synthStateUniformLocation,
        samplerUniformLocation,
        samplerPrevUniformLocation,
        mixUniformLocation,
        mediaState,
        textUniformLocation,
        textPrevUniformLocation,
        textMixUniformLocation,
        textState,
        // name -> uniform location (or null), filled in by applyVisualParams
        visualParamLocations: new Map(),
    };
}

// One frame with every uniform the app provides — shared by the live render
// loop and the video export so the two can't drift apart.
function drawFrame(ctx, currentTimeSeconds) {
    const gl = ctx.glContext;

    const mix = updateMediaStateAndGetMix(gl, ctx.mediaState, currentTimeSeconds);
    const textMix = updateTextStateAndGetMix(gl, ctx.textState, currentTimeSeconds);
    bindMediaTextures(gl, ctx.mediaState,
        ctx.samplerUniformLocation, ctx.samplerPrevUniformLocation, ctx.mixUniformLocation, mix);
    bindTextTextures(gl, ctx.textState,
        ctx.textUniformLocation, ctx.textPrevUniformLocation, ctx.textMixUniformLocation, textMix);

    gl.uniform1f(ctx.timeUniformLocation, currentTimeSeconds);
    gl.uniform1fv(ctx.targetNoteStatesUniformLocation, getTargetNoteStates());
    gl.uniform1fv(ctx.smoothedNoteStatesUniformLocation, computeSmoothedNoteStates());
    gl.uniform1fv(ctx.synthStateUniformLocation, getSynthState());
    applyVisualParams(ctx, currentTimeSeconds);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export function setupWebGL(source, targetCanvas, customGetTimeSeconds = null) {
    if (source.trim().length === 0) {
        setUseDefaultVisualizer(true);
        return;
    }
    if (getUseDefaultVisualizer()) {
        clearPositions();
        setUseDefaultVisualizer(false);
    }
    canvas = targetCanvas;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const ctx = configureGLContext(source);

    const render = () => {
        if (exporting || getUseDefaultVisualizer()) {
            return;
        }
        if (ctx.glContext.getParameter(ctx.glContext.CURRENT_PROGRAM) != ctx.program) {
            return;
        }
        const currentTimeSeconds = customGetTimeSeconds ? customGetTimeSeconds() : getCurrentTimeSeconds();

        drawFrame(ctx, currentTimeSeconds);

        window.requestAnimationFrame(render);
    }

    render();
}

export async function exportVideo(source, eventlist) {
    exporting = true;

    const { Muxer, FileSystemWritableFileStreamTarget } = (await import('https://cdn.jsdelivr.net/npm/webm-muxer@3.0.3/+esm')).default;

    let fileHandle = await window.showSaveFilePicker({
        suggestedName: `video.webm`,
        types: [{
            description: 'Video File',
            accept: { 'video/webm': ['.webm'] }
        }],
    });
    let fileStream = await fileHandle.createWritable();

    const width = 1280, height = 720;
    let muxer = new Muxer({
        target: new FileSystemWritableFileStreamTarget(fileStream),
        video: {
            codec: 'V_VP9',
            width,
            height
        }
    });

    canvas.width = width;
    canvas.height = height;

    const ctx = configureGLContext(source);

    const framerate = 30;

    const init = {
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => {
            console.log(e.message);
        },
    };

    const config = {
        codec: 'vp09.00.10.08',
        hardwareAcceleration: 'prefer-software',
        width,
        height,
        bitrate: 2_000_000, // 2 Mbps
        framerate,
    };

    const encoder = new VideoEncoder(init);
    encoder.configure(config);

    let frame_counter = 0;
    const currentTimeMillisFunc = async () => frame_counter * 1000 / framerate;
    setGetCurrentTimeFunction(currentTimeMillisFunc);
    visualizeSong(eventlist);
    const totalFrames = eventlist[eventlist.length - 1].time * framerate / 1000;

    for (; frame_counter < totalFrames; frame_counter++) {
        setProgressbarValue(frame_counter / totalFrames);
        await new Promise(r => requestAnimationFrame(r));

        const currentTimeMillis = await currentTimeMillisFunc();
        const currentTimeSeconds = currentTimeMillis / 1000;

        drawFrame(ctx, currentTimeSeconds);

        const frame = new VideoFrame(canvas, { timestamp: currentTimeMillis * 1000 });
        const keyFrame = (frame_counter % framerate) == 0;
        encoder.encode(frame, { keyFrame });
        if (keyFrame) {
            await encoder.flush();
        }
        frame.close();
    }

    console.log('Flushing encoder');
    await encoder.flush();
    console.log('Finalizing mixer');
    muxer.finalize();
    console.log('Closing filestream');
    await fileStream.close();
    setProgressbarValue(null);

}