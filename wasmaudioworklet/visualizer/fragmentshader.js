import { setProgressbarValue } from '../common/ui/progress-bar.js';
import { getCurrentTimeSeconds, setUseDefaultVisualizer, getUseDefaultVisualizer, getTargetNoteStates, clearPositions } from './defaultvisualizer.js';
import { setGetCurrentTimeFunction, visualizeSong } from './midieventlistvisualizer.js';
import { getActiveVideo } from './videoscheduler.js';

const vertexShaderSrc = `            
attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0, 1);
}
`;

let exporting = false;
let canvas;

function initTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because video has to be download over the internet
    // they might take a moment until it's ready so
    // put a single pixel in the texture so we can
    // use it immediately.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
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
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, video);
}

function configureGLContext(source) {
    const glContext = canvas.getContext("webgl");

    glContext.viewport(0, 0, glContext.drawingBufferWidth, glContext.drawingBufferHeight);
    glContext.clearColor(0.0, 0.0, 0.0, 1.0);
    glContext.clear(glContext.COLOR_BUFFER_BIT);

    const texture = initTexture(glContext);

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

    const positionLocation = glContext.getAttribLocation(program, "a_position");
    glContext.enableVertexAttribArray(positionLocation);
    glContext.vertexAttribPointer(positionLocation, 2, glContext.FLOAT, false, 0, 0);

    glContext.drawArrays(glContext.TRIANGLES, 0, 6);

    return {
        program,
        glContext,
        timeUniformLocation,
        targetNoteStatesUniformLocation,
        texture
    };
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

    const {
        program,
        glContext,
        timeUniformLocation,
        targetNoteStatesUniformLocation,
        texture
    } = configureGLContext(source);

    const render = () => {
        if (exporting || getUseDefaultVisualizer()) {
            return;
        }
        if (glContext.getParameter(glContext.CURRENT_PROGRAM) != program) {
            return;
        }
        const currentTimeSeconds = customGetTimeSeconds ? customGetTimeSeconds() : getCurrentTimeSeconds();

        const currentVideo = getActiveVideo(currentTimeSeconds * 1000);
        if (currentVideo) {
            updateTexture(glContext, texture, currentVideo);
        }

        glContext.uniform1f(timeUniformLocation, currentTimeSeconds);
        glContext.uniform1fv(targetNoteStatesUniformLocation, getTargetNoteStates());
        glContext.drawArrays(glContext.TRIANGLES, 0, 6);

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

    const {
        glContext,
        timeUniformLocation,
        targetNoteStatesUniformLocation,
        texture
    } = configureGLContext(source);

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

        const currentVideo = getActiveVideo(currentTimeMillis);
        if (currentVideo) {
            updateTexture(glContext, texture, currentVideo);
        }

        glContext.uniform1f(timeUniformLocation, currentTimeMillis / 1000);
        glContext.uniform1fv(targetNoteStatesUniformLocation, getTargetNoteStates());
        glContext.drawArrays(glContext.TRIANGLES, 0, 6);

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