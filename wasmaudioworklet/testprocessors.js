let instance;

class MyWorkletProcessor extends AudioWorkletProcessor {

  constructor() {
    super();
    this.port.onmessage = async (msg) => {      
      instance = (await WebAssembly.instantiate(msg.data.wasm)).instance
    };
    this.port.start();
  }  

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    
    const ret = instance ? instance.exports.add(1,2) : 0;
    
    for (let channel = 0; channel < output.length; ++channel) {
        const channeldata = output[channel];

        for(let n = 0; n < channeldata.length; n++) {
            channeldata[n] = Math.sin(
                ( ret * 440 * (currentFrame + n) / sampleRate ) * (Math.PI * 2)
            );
        }
    }

    return true;
  }
}

registerProcessor('my-worklet-processor', MyWorkletProcessor);
