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
    AudioContext.prototype.audioWorklet = {
        addModule: async function(modulepath) {
            await import(modulepath).then(module => console.log('module loaded', module));
        }        
    };

    window.AudioWorkletNode = class AudioWorkletNode {
        constructor(context, processorName, options) {
            this.connected = false;
            AudioWorkletGlobalScope.sampleRate = context.sampleRate;
            window.sampleRate = context.sampleRate;

            this.processorInstance = new window.audioWorkletProcessors[processorName](options);
            this.processorInstance.port.postMessage = (msg) => {
                setTimeout(() => this.onmessage({data: msg}), 0);
            }

            this.context = context;
            this.port = {
                start: () => true,
                postMessage: async (msg) => {
                    this.processorInstance.port.onmessage({
                        data: msg
                    });
               }
           };
        }
        
        connect(destination) {
            console.log('connect', destination);
            
            let chunkIndex = 0;
            let chunkOffsetTime = 0;

            let processorBuffers = 1;
            let latencyStable = false;

            const createAudioChunk = () => {
                if (!this.connected) {
                    return;
                }
                const processor = this.processorInstance;
                
                const processorFrames = 128;
                const processorBuffer = this.context.createBuffer(2, processorFrames * processorBuffers,
                                                        this.context.sampleRate);
                
                if ( latencyStable ) {
                    for(let processorBufferIndex = 0; processorBufferIndex < processorBuffers; processorBufferIndex++) {
                        const subarrayindex = processorBufferIndex * processorFrames;
                        processor.process([],[[
                            processorBuffer.getChannelData(0).subarray(subarrayindex, subarrayindex + processorFrames),
                            processorBuffer.getChannelData(1).subarray(subarrayindex, subarrayindex + processorFrames)
                        ]]);
                    }
                }

                const bufferSource = this.context.createBufferSource();
                bufferSource.buffer = processorBuffer;
                
                bufferSource.connect(destination);
                
                const chunkStartTime = chunkOffsetTime +
                                        ((chunkIndex * processorFrames * processorBuffers) /
                                            this.context.sampleRate);
                chunkIndex ++;

                bufferSource.start(chunkStartTime);
                                    
                let nextChunkTimeout = chunkStartTime - this.context.currentTime;
                // console.log(chunkStartTime, context.currentTime, nextChunkTimeout, processorBuffers);
                if(nextChunkTimeout < 0.005 ) {
                    // Increase buffer size if timeout to next chunk is less than 10ms
                    nextChunkTimeout = 0;
                    processorBuffers++;
                    chunkIndex = 1;
                    chunkOffsetTime = chunkStartTime;
                } else {
                    latencyStable = true;
                }
                
                setTimeout(() => createAudioChunk(), nextChunkTimeout * 1000);
            };
            this.connected = true;
            createAudioChunk();
            
        }

        disconnect() {
            this.connected = false;
            console.log('disconnect');
        }
    };

    class AudioWorkletProcessorPolyfill {
        constructor() {
            this.port = {
                onmessage: function() {},
                postMessage: function(msg) {},
                start: function() {}
            };
        }
    };

    class AudioWorkletGlobalScope {
        static registerProcessor(name, processorClass) {
            if(!window.audioWorkletProcessors) {
                window.audioWorkletProcessors = {};
            }
            window.audioWorkletProcessors[name] = processorClass;
        }
    };

    window.AudioWorkletProcessor = AudioWorkletProcessorPolyfill;
    window.registerProcessor = AudioWorkletGlobalScope.registerProcessor;
    window.AudioWorkletGlobalScope = AudioWorkletGlobalScope;
}
