// YOSHIMI WAM Controller
// Jari Kleimola 2018-19 (jari@webaudiomodules.org)

var WAM = WAM || {}

WAM.YOSHIMI = class YOSHIMI extends WAMController
{
  constructor (actx, state) {
    var options = {};
    options.numberOfInputs  = 0;
    options.numberOfOutputs = 1;
    options.outputChannelCount = [2];
    options.processorOptions = { desc:state, wasm:YOSHIMI.wasm, js:YOSHIMI.js }

    super(actx, "YOSHIMI", options);
  }

  waitForMessage() {
    return new Promise(resolve => this.waitForMessageResolve = resolve);
  }

  onmessage(msg) {
      if (this.waitForMessageResolve) {
        this.waitForMessageResolve(msg);
        this.waitForMessageResolve = null;
      }
  }

  async postSynthSource(synthsource) {
    if (synthsource.substr(0, '<?xml'.length) === '<?xml') {
        console.log('updating synth');
        this.sendMessage("set", "param", synthsource);
        await this.waitForMessage();
    }
  }
  async loadpreset(channel, filename) {  
    const url = `https://unpkg.com/wasm-yoshimi@0.0.1/banks/${filename}`;
    let xml;
    try {
      let data = await fetch(url).then(r => r.arrayBuffer());
      let gzip = new Zlib.Gunzip(new Uint8Array(data));
      let utf8 = gzip.decompress();
      xml  = new TextDecoder("utf-8").decode(utf8);
      
    } catch(err) {
      xml  = await fetch(url).then(r => r.text());
    }
    this.sendMessage("set", `patch${channel}`, xml);
    return await this.waitForMessage();
  }
  // -- wasm and scripts need to be loaded first, and in order
  //
  static async importScripts (actx, prefix = "") {
    YOSHIMI.wasm = await YOSHIMI.load("https://unpkg.com/wasm-yoshimi@0.0.1/worklet/yoshimi.wasm", "bin");    
    YOSHIMI.js   = await YOSHIMI.load("https://unpkg.com/wasm-yoshimi@0.0.1/worklet/yoshimi.js", "text");    
    // YOSHIMI.wasm = await YOSHIMI.load("yoshimi.wasm", "bin");
    // YOSHIMI.js = await YOSHIMI.load("yoshimi.js", "text");
    await actx.audioWorklet.addModule("https://unpkg.com/wasm-yoshimi@0.0.1/libs/wam-processor.js");
    await actx.audioWorklet.addModule("webaudiomodules/yoshimi-awp.js");
  }

  static async load (url,type) {
    let resp = await fetch(url);
    let abuf = await (type == "bin") ? resp.arrayBuffer() : resp.text();
    return abuf;
  }
}

WAM.YOSHIMI.title = "webYOSHIMI";
