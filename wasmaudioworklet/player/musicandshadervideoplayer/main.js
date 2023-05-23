import { decodeBufferFromPNG } from '../../common/png.js';
import { setupWebGL } from '../../visualizer/fragmentshader.js';
import videoschedule from '../../mediacontent/videoschedule.js';
import { setVideoSchedule } from '../../visualizer/videoscheduler.js';

const pngbytes = await fetch(new URL('ufo.wasm.png', import.meta.url)).then(r => r.arrayBuffer());
const wasmBytes = await decodeBufferFromPNG(URL.createObjectURL(new Blob([pngbytes], {type: 'image/png'})));

const sampleRate = 44100;

const durationFrames = sampleRate - (sampleRate % 128);
const durationMillis = durationFrames * 1000.0 / sampleRate;
const numBuffers = Math.floor(150000 / durationMillis);

let audioCtx;
let audioBufSrcNode;

const playbutton = document.getElementById('playbutton');

const worker = new Worker(new URL('renderworker.js', import.meta.url), { type: 'module' });

const buffers = [];

async function createBuffers(sendWasm = false) {
    const { leftbuffer, rightbuffer } = await new Promise(async resolve => {
        worker.postMessage({
            wasm: sendWasm ? wasmBytes : undefined,
            samplerate: sampleRate,
            songduration: durationMillis
        });
        worker.onmessage = msg => {
            if (msg.data.leftbuffer) {
                resolve(msg.data);
            } else {
                //document.querySelector('#loaderprogress').innerHTML = (msg.data.progress * 100).toFixed(2) + '%';
            }
        }
    });
    buffers.push({leftbuffer, rightbuffer});
}
createBuffers(true);

let chunkStartTime;

const startAudioBufSrcNode = async () => {
    for (let bufferNdx = 0; audioCtx && bufferNdx < numBuffers; bufferNdx++) {
        if (!buffers[bufferNdx]) {
            await createBuffers();
            console.log('created', bufferNdx);
        }
        const audioBuf = audioCtx.createBuffer(2, durationFrames, sampleRate);
        audioBuf.getChannelData(0).set(new Float32Array(buffers[bufferNdx].leftbuffer));
        audioBuf.getChannelData(1).set(new Float32Array(buffers[bufferNdx].rightbuffer));
        audioBufSrcNode = audioCtx.createBufferSource();
        audioBufSrcNode.buffer = audioBuf;

        audioBufSrcNode.connect(audioCtx.destination);
        audioBufSrcNode.loop = false;
        audioBufSrcNode.start(chunkStartTime);
        chunkStartTime += durationMillis / 1000.0;
    }
};

if (audioCtx && audioBufSrcNode) {
    audioBufSrcNode.stop();
    audioBufSrcNode.disconnect();
    audioBufSrcNode = null;
    startAudioBufSrcNode();
}

playbutton.onclick = () => {
    if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
        return;
    }
    audioCtx = new AudioContext();
    const bufferingtime = 0.2;
    chunkStartTime = audioCtx.currentTime + bufferingtime;

    startAudioBufSrcNode();
};

videoschedule.forEach(sch => {
    const imageElement = new Image();
    imageElement.crossOrigin = 'anonymous';
    imageElement.src = 'https://ipfs.web4.near.page/ipfs/bafybeigkce5cwsexdffhoyiixqavwoifpbl457eyeprmtxcm4y4p2iwiie/ufo/' + sch.imageUrl;
    sch.video = {
        imageElement
    };    
});
setVideoSchedule(videoschedule);

setupWebGL(`
precision highp float;
uniform vec2 resolution;
uniform sampler2D uSampler;
uniform float time;
uniform float targetNoteStates[128];

void main(void) {
  float yvsxratio = 1152.0/1280.0;
  float width = resolution.y / yvsxratio;
  
  vec2 ratio = vec2(width, resolution.y);  
  float margin = ((resolution.x - width) * 0.5) / resolution.x;
  
  float x = (gl_FragCoord.x / resolution.x);
  
  if (x >= margin && x < (1.0-margin)) {
  	float offset = -margin * (resolution.x / width);
    vec4 texelColor = texture2D(uSampler, (gl_FragCoord.xy / ratio) * vec2(1.0,-1.0) + vec2(offset, 1.0));    
    float alpha = 0.0;
    float fadeduration = 4.0;
    float fadeoutduration = 1.0;
    float fadeout = 2.0 * 60.0 + 28.0;
    if (time < fadeduration) {
    	alpha = time / fadeduration;
    } else if (time > fadeout && time < (fadeout + fadeoutduration)) {
    	alpha = 1.0 - ((time - fadeout) / fadeoutduration);
    } else {
        alpha = 1.0;
    }
    
    gl_FragColor = vec4(texelColor.rgb * alpha, texelColor.a);
  } else {
  	gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  }
}
`, document.getElementById('videocanvas'), () => audioCtx?.currentTime  ?? 0);
