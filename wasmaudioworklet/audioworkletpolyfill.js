/**
 * Simple audioworklet polyfill using chained audio buffer source nodes
 * 
 * Written by Peter Johan Salomonsen - (c) 2019
 * 
 */

if(typeof AudioContext !== 'function') {
    window.AudioContext = window.webkitAudioContext;
}

if(typeof AudioWorkletNode !== 'function') {
    console.log('No audioworklet support - using polyfill');
    window.AudioWorkletNode = function(context, processorName) {
        let connected = false;
        return {
           port: {
               start: function() {
                   console.log('start');
                   window.audioWorkletProcessors[processorName].port.postMessage = (msg) => {
                    this.onmessage({data: msg});
                   }
               },
               postMessage: function(msg) {
                    window.audioWorkletProcessors[processorName].port.onmessage({
                        data: msg
                    });
               }
           },
           connect: function(destination) {
                console.log('connect', destination);
                
                let chunkIndex = 0;
                let chunkOffsetTime = 0;

                let processorBuffers = 1;

                const createAudioChunk = () => {
                    if(!connected) {
                        return;
                    }
                    const processor = window.audioWorkletProcessors[processorName];
                    
                    const processorFrames = 128;
                    const processorBuffer = context.createBuffer(2, processorFrames * processorBuffers, context.sampleRate);
                    
                    for(let processorBufferIndex = 0; processorBufferIndex < processorBuffers; processorBufferIndex++) {
                        const subarrayindex = processorBufferIndex * processorFrames;
                        processor.process([],[[
                            processorBuffer.getChannelData(0).subarray(subarrayindex, subarrayindex + processorFrames),
                            processorBuffer.getChannelData(1).subarray(subarrayindex, subarrayindex + processorFrames)
                        ]]);
                    }

                    const bufferSource = context.createBufferSource();
                    bufferSource.buffer = processorBuffer;
                    
                    bufferSource.connect(destination);
                    
                    const chunkStartTime = chunkOffsetTime +
                                            ((chunkIndex * processorFrames * processorBuffers) /
                                                context.sampleRate);
                    chunkIndex ++;

                    bufferSource.start(chunkStartTime);
                                        
                    let nextChunkTimeout = chunkStartTime - context.currentTime;
                    if(nextChunkTimeout <= 0 ) {
                        nextChunkTimeout = 0;
                        processorBuffers *= 2;
                        chunkIndex = 1;
                        chunkOffsetTime = chunkStartTime;
                    }
                    // console.log(chunkStartTime, context.currentTime, nextChunkTimeout, processorBuffers);
                    setTimeout(() => createAudioChunk(), nextChunkTimeout * 1000);
                };
                connected = true;
                createAudioChunk();
                
           },
           disconnect: function() {
               connected = false;
               console.log('disconnect');
           }
       };
    }
    AudioContext.prototype.audioWorklet = {
        addModule: async function(modulepath) {
            const processorSource = await (await fetch(modulepath)).text();            
            const processorFunction = new Function(processorSource);
            await processorFunction();
        }        
    };

    class AudioWorkletProcessorPolyfill {
        constructor() {
            this.port = {
                onmessage: function() {},
                postMessage: function(msg) {

                },
                start: function() {}
            };
        }
    };
    window.AudioWorkletProcessor = AudioWorkletProcessorPolyfill;
    window.registerProcessor = function(name, processorClass) {
        if(!window.audioWorkletProcessors) {
            window.audioWorkletProcessors = {};
        }
        window.audioWorkletProcessors[name] = new processorClass();
    }
}
