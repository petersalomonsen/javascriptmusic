let samplebufferpos = 0;
let heapoffset;
let samplebufferview;
let samplebuffersize;

let memaddr;
let targetsamplerate;

const SAMPLE_FRAMES = 128;
let xmp = null;

async function initPlayer (wasm, samplerate) {
    if(xmp) {
        return;
    }

    targetsamplerate = samplerate;

    const NOT_IMPLEMENTED = () => {
        console.error('not implemented');
    };

    
    xmp = await WebAssembly.instantiate(
            wasm
        , {
        "wasi_snapshot_preview1": {
            "fd_close": NOT_IMPLEMENTED,
            "fd_write": NOT_IMPLEMENTED,
            "fd_seek": NOT_IMPLEMENTED,
            "fd_read": NOT_IMPLEMENTED,
            "environ_get": NOT_IMPLEMENTED,
            "environ_sizes_get": NOT_IMPLEMENTED,
            "args_sizes_get": NOT_IMPLEMENTED,
            "args_get": NOT_IMPLEMENTED,
            "proc_exit": NOT_IMPLEMENTED,
        }
    });
    // 1 MB is more than enough for an Amiga mod
    memaddr = xmp.instance.exports.allocMemoryForModule(1024 * 1024);
}

function loadSong(modbytes) {
    const heap8 = new Uint8Array(xmp.instance.exports.memory.buffer);    
    heap8.set(modbytes, memaddr);

    const pos = xmp.instance.exports.getPosition();
    const row = xmp.instance.exports.getRow();
    const bpm = xmp.instance.exports.getBPM();

    xmp.instance.exports.loadModule(memaddr, modbytes.byteLength, targetsamplerate);  
    xmp.instance.exports.setPlayerParameter(1,30); // XMP_PLAYER_MIX
    xmp.instance.exports.setPlayerParameter(11, 3 ); // XMP_PLAYER_MODE = XMP_MODE_PROTRACKER

    xmp.instance.exports.setPosition(pos);
    xmp.instance.exports.setRow(row);
    xmp.instance.exports.setBPM(bpm);
}

class MyWorkletProcessor extends AudioWorkletProcessor {

  constructor() {
    super();
    this.port.onmessage = async (msg) => {
        if(msg.data.wasm) {
            await initPlayer(msg.data.wasm, msg.data.samplerate);
        }
        if(msg.data.song) {
            loadSong(msg.data.song.modbytes);
        }
    };
    this.port.start();
  }  

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    
    if(xmp) {
        for (var n=0; n < SAMPLE_FRAMES; n++) {
            if(samplebufferpos === 0) {
                const frameinfo = xmp.instance.exports.playFrame();
                samplebufferview = new DataView(xmp.instance.exports.memory.buffer);
                const heap32 = new Uint32Array(xmp.instance.exports.memory.buffer);
        
                heapoffset = heap32[(frameinfo/4) + 10];
                samplebuffersize = heap32[(frameinfo/4) + 11];
            }
            
            output[0][n] = samplebufferview.getInt16(heapoffset + (samplebufferpos), true) / 32768.0;
            output[1][n] = samplebufferview.getInt16(heapoffset + (samplebufferpos + 2), true)  / 32768.0 ;
            samplebufferpos += 4;

            if (samplebufferpos === samplebuffersize) {
                samplebufferpos = 0;
            }
        }
    }
  
    return true;
  }
}

registerProcessor('my-worklet-processor', MyWorkletProcessor);
