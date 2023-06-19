import { decodeBufferFromPNG } from '../../common/png.js';
import { setupWebGL } from '../../visualizer/fragmentshader.js';

import { setVideoSchedule } from '../../visualizer/videoscheduler.js';
import { setProgressbarValue } from '../../common/ui/progress-bar.js';

const videoschedule = await fetch('https://ipfs.web4.near.page/ipfs/bafkreidfijq3nuaadxcq53nwe2dc4desh6qkpkqfdpastvpz4ygrxfa3pu?filename=videoschedule.json').then(r => r.json());
const wasmBytes = await fetch('https://ipfs.web4.near.page/ipfs/bafkreia4im6lcfcgdy4wqeulmmt6v73nkmzabwwlaiivcmlgc7lt4f7nve?filename=ufo.wasm').then(r => r.arrayBuffer());

const sampleRate = 44100;

const durationFrames = sampleRate - (sampleRate % 128);
const durationMillis = durationFrames * 1000.0 / sampleRate;
const numBuffers = Math.floor(150000 / durationMillis);

let songStartTime;

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
    buffers.push({ leftbuffer, rightbuffer });
}

const result = await fetch('https://rpc.mainnet.near.org', {
    method: 'POST',
    headers: {
        'content-type': 'application/json'
    },
    body: JSON.stringify({
        "jsonrpc": "2.0",
        "id": "dontcare",
        "method": "query",
        "params": {
            "request_type": "call_function",
            "finality": "final",
            "account_id": "jsinrustnft.near",
            "method_name": "nft_token",
            "args_base64": btoa(JSON.stringify({ token_id: 'aliens_close' }))
        }
    })
}).then(r => r.json());
const nftdata = JSON.parse(result.result.result.map(c => String.fromCharCode(c)).join(''));

async function createWelcomeImage() {

    // Create the offscreen canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Set canvas dimensions based on the text size
    canvas.width = 1152;
    canvas.height = 1280;

    // Set canvas size and drawing context
    context.font = "70px Arial";

    // Set text color and draw text onto the canvas
    context.fillStyle = '#fff';
    const owner_width = context.measureText(nftdata.owner_id).width;
    const id_width = context.measureText(nftdata.token_id).width;
    
    context.fillText(nftdata.owner_id, (canvas.width - owner_width) / 2, 400);
    context.fillText('proudly presents', 350, 500);
    context.fillText(nftdata.token_id, (canvas.width - id_width) / 2, 600);

    return canvas.toDataURL();
}

let chunkStartTime;

const startAudioBufSrcNode = async () => {
    for (let bufferNdx = 0; audioCtx && bufferNdx < numBuffers; bufferNdx++) {
        while (!buffers[bufferNdx]) {
            await new Promise(r => setTimeout(() => r(), 1));
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

playbutton.onclick = async () => {
    try {
        playbutton.style.visibility = 'hidden';

        if (audioCtx) {
            audioCtx.close();
            audioCtx = null;
            return;
        }
        audioCtx = new AudioContext();

        let numConcurrent = 0;
        setProgressbarValue(0);

        let renderStartTime = new Date().getTime();

        const totalDurationMillis = durationMillis * numBuffers;
        let timeNotYetRendered = totalDurationMillis;
        let estimatedRenderTimeLeft = timeNotYetRendered * 2;
        let audiorendererror;
        (async () => {
            try {
                await createBuffers(true);
                timeNotYetRendered -= durationMillis;
                for (let n = 1; n < numBuffers; n++) {
                    await createBuffers();

                    estimatedRenderTimeLeft = ((numBuffers - n) * (new Date().getTime() - renderStartTime) / n);
                    timeNotYetRendered = durationMillis * (numBuffers - n);
                }
                estimatedRenderTimeLeft = 0;
                timeNotYetRendered = 0;
            } catch (e) {
                audiorendererror = e;
            }
        })();

        const welcomeImageUrl = await createWelcomeImage();

        await Promise.all(videoschedule.map(async (schedule, ndx) => {
            const imageElement = new Image();
            imageElement.crossOrigin = 'anonymous';
            if (schedule.imageUrl.indexOf('data:') == 0) {
                imageElement.src = schedule.imageUrl;
            } else {
                while (numConcurrent > 10) {
                    await new Promise(resolve => setTimeout(() => resolve(), 1));
                }
                numConcurrent++;
                let imagedata;
                let lasterror;
                for (let retrycount = 0; retrycount < 3 && !imagedata; retrycount++) {
                    try {
                        if (schedule.startTime <= 2000) {
                            imagedata = welcomeImageUrl;
                            imageElement.src = imagedata;
                        } else {
                            imagedata = await fetch('https://ipfs.web4.near.page/ipfs/bafybeigkce5cwsexdffhoyiixqavwoifpbl457eyeprmtxcm4y4p2iwiie/ufo/' + schedule.imageUrl).then(r => r.arrayBuffer());
                            imageElement.src = URL.createObjectURL(new Blob([imagedata], { type: 'image/jpg' }));
                        }

                        numConcurrent--;
                        setProgressbarValue(videoschedule.filter(sch => sch.video != undefined).length / videoschedule.length, 'loading images');
                    } catch (e) {
                        lasterror = e;
                        await new Promise(resolve => setTimeout(() => resolve(), 500));
                    }
                }
                if (!imagedata) {
                    throw lasterror;
                }
            }
            schedule.video = {
                imageElement
            };
        }));
        setVideoSchedule(videoschedule);

        while (!audiorendererror && estimatedRenderTimeLeft > timeNotYetRendered) {
            setProgressbarValue((totalDurationMillis - timeNotYetRendered) / totalDurationMillis, 'rendering audio');
            await new Promise(r => setTimeout(() => r(), 1));
        }

        if (audiorendererror) {
            throw audiorendererror;
        }
        setProgressbarValue(null);

        try {
            await document.documentElement.requestFullscreen();
        } catch (e) {
            console.error('full screen not possible');
        }
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
            `, document.getElementById('videocanvas'), () => audioCtx?.currentTime - songStartTime ?? 0);

        const bufferingtime = 0.2;
        chunkStartTime = audioCtx.currentTime + bufferingtime;
        songStartTime = chunkStartTime;
        startAudioBufSrcNode();
    } catch (e) {
        setProgressbarValue(null);
        document.body.innerHTML = e;
    }
};

