const fs = require('fs');

const buf = fs.readFileSync('/Users/peter/piaaano.raw');
const dw = new DataView(buf.buffer);

const wasmModule = new WebAssembly.Module(fs.readFileSync('./fft.wasm'));
const wasmInstance = new WebAssembly.Instance(wasmModule, { env: {
    abort(msgPtr, filePtr, line, column) {
      throw new Error(`index.ts: abort at [${ line }:${ column }]`);
    }
  } }).exports

const buffersize_shift = 7;
const buffersize = 1 << buffersize_shift;
const fft = wasmInstance.createFFT(buffersize_shift);

const spectrumdata = [];
for (var n=0;n < buf.length; n+=4) {
    wasmInstance.setComplex(fft, (n / 4) % buffersize, dw.getFloat32(n, true), 0);
    
    if((n % (buffersize * 4)) === ((buffersize * 4) - 4)) {
        wasmInstance.calculateFFT(fft);
                
        const reals = new Float32Array(buffersize);
        const imgs = new Float32Array(buffersize);
        for (var y=0; y<buffersize; y++) {
            reals[y] = wasmInstance.getComplexRe(fft, y);
            imgs[y] = wasmInstance.getComplexIm(fft, y);          
        }
        spectrumdata.push([
            Array.from(reals),
            Array.from(imgs)]);
        
    }
}

const magnitudephasedata = spectrumdata.map(arrs => {
    const re = arrs[0];
    const im = arrs[1];    
    const magnitudes = re.map((v, n) => Math.sqrt(re[n] * re[n] + im[n] * im[n]));
    const phases = re.map((v, n) => Math.atan2(im[n], re[n]));
    const combined = magnitudes.map((m, n) => ({ndx: n, magnitude: m, phase: phases[n]}))
                        .sort((a, b) => b.magnitude - a.magnitude);
    const filtered = combined.filter(m => m.magnitude > 0.01);
    return filtered.map(m => [m.ndx,
            m.magnitude, 
            (m.phase + (2* Math.PI)) % (2* Math.PI)
        ]);
});

const maxMagnitude = magnitudephasedata.reduce((p, arrs) => {
        const t = arrs.reduce((a, b) => b[1] > a ? b[1] : a, 0);
        return t > p ? t : p;
    }, 0);

const totalMagnitudePhasePairs = magnitudephasedata.reduce((p, arrs) =>
    arrs.length + p
, 0);

const bytes = new Uint8Array(magnitudephasedata.length + totalMagnitudePhasePairs * 3);
let outndx = 0;
magnitudephasedata.forEach(freqs => {
    bytes[outndx++] = freqs.length;
    freqs.forEach(f => {
        bytes[outndx++] = f[0];
        bytes[outndx++] = Math.round(f[1] * 255 / maxMagnitude);
        bytes[outndx++] = Math.round(f[2] * 255 / ( 2 * Math.PI ));
    });
});
// console.log(maxMagnitude, totalMagnitudePhasePairs, magnitudephasedata.length * buffersize);

fs.writeFileSync('pianofreqs.raw', bytes);
fs.writeFileSync('pianofreqs.json', '[' + bytes.join(',') + ']');

const SAMPLERATE = 44100;
const NOTE_FREQ = 440;
let t = 0;
let v = 0;

async function writeWithInterpolation(val) {
    const currentT = t;
    t += (SAMPLERATE / (NOTE_FREQ * buffersize));

    const outbuf = new Uint8Array((Math.floor(t) - Math.floor(currentT)) * 4);
    const outdw = new DataView(outbuf.buffer);
    let outdwndx = 0;
    for ( let ndx = Math.floor(currentT); ndx < Math.floor(t); ndx++) {
        const sampleVal = (((ndx + 1 - currentT ) / (t - currentT)) * (val - v)) + v;
        outdw.setFloat32(outdwndx, sampleVal, true);
        outdwndx+=4;
    }
    process.stdout.write(outbuf);
    v = val;
}

function additive(arrs) {    
    for (var n=0;n<buffersize;n++) {  
        const t = n / buffersize;        
        writeWithInterpolation((1 / buffersize) * 
            arrs.reduce((prev, curr) =>
                prev + (curr[1] * Math.cos(2 * Math.PI * t * curr[0] + curr[2])) ,
            0));
    }
}

let prev = -1;
let ptr = 0;
let additivedata = [];
for(var n=0;n<magnitudephasedata.length; n+= (440 / NOTE_FREQ)) {
    const curr = Math.floor(n);
    if (curr > prev) {
        const numfreqs = bytes[ptr++];
        additivedata = [];
        for(var i=0;i<numfreqs;i++) {
            additivedata.push([bytes[ptr++],
                bytes[ptr++] * maxMagnitude / 255,
                bytes[ptr++] * 2 * Math.PI / 255]);
        }
        prev = curr;
    }
    additive(additivedata);
    // additive(magnitudephasedata[Math.floor(n)]);
}

// console.log(maxMagnitude);