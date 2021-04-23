/**
 * Simple audioworklet polyfill using chained audio buffer source nodes
 * 
 * Written by Peter Johan Salomonsen - (c) 2019
 * 
 */

export let browserSupportsAudioWorklet = true;

export function applyPolyfill(audioCtx) {
    if (typeof AudioContext !== 'function') {
        window.AudioContext = window.webkitAudioContext;
    }

    if (typeof OfflineAudioContext !== 'function') {
        window.OfflineAudioContext = class OfflineAudioContext {
            constructor(numberOfChannels, length, sampleRate) {
                console.error('OfflineAudioContext not implemented');
            }
        }
    }

    

    if (typeof AudioWorkletNode !== 'function') {
        console.log('No audioworklet support - using polyfill');
        AudioContext.prototype.audioWorklet = {
            addModule: async function (modulepath) {
                await import(modulepath).then(module => console.log('module loaded', module));
            }
        };
        browserSupportsAudioWorklet = false;
    } else if (audioCtx) {
        if (!audioCtx.audioWorklet) {
            audioCtx.audioWorklet = {};
        }
        audioCtx.audioWorklet.addModule = async function (modulepath) {
            await import(modulepath).then(module => console.log('module loaded', module));
        };
    }


    if (!browserSupportsAudioWorklet || audioCtx) {
        window.AudioWorkletNode = class AudioWorkletNode {
            constructor(context, processorName, options) {
                this.connected = false;
                AudioWorkletGlobalScope.sampleRate = context.sampleRate;
                window.sampleRate = context.sampleRate;

                this.processorInstance = new window.audioWorkletProcessors[processorName](options);
                this.processorInstance.port.postMessage = (msg) => {
                    setTimeout(() => this.port.onmessage({ data: msg }), 0);
                }

                this.context = context;
                this.port = {
                    start: () => true,
                    postMessage: async (msg) => {
                        this.processorInstance.port.onmessage({
                            data: msg
                        });
                    },
                    close: () => { },
                    onmessage: () => { }
                };
            }

            connect(destination) {
                console.log('connect', destination);

                let bufferingtime = 0.2;
                let chunkStartTime = this.context.currentTime + bufferingtime;

                const createAudioChunk = () => {
                    if (!this.connected) {
                        return;
                    }
                    const processor = this.processorInstance;

                    const processorFrames = 128;

                    const buffersNeeded = Math.floor(this.context.sampleRate * ((this.context.currentTime + bufferingtime) - chunkStartTime) / processorFrames);

                    if (buffersNeeded > 0) {
                        const numBuffers = buffersNeeded > 32 ? 32 : buffersNeeded;

                        const processorBuffer = this.context.createBuffer(2, processorFrames * numBuffers,
                            this.context.sampleRate);
                        
                        for (let processorBufferIndex = 0; processorBufferIndex < numBuffers; processorBufferIndex++) {
                            const subarrayindex = processorBufferIndex * processorFrames;
                            processor.process([], [[
                                processorBuffer.getChannelData(0).subarray(subarrayindex, subarrayindex + processorFrames),
                                processorBuffer.getChannelData(1).subarray(subarrayindex, subarrayindex + processorFrames)
                            ]]);
                        }

                        if (chunkStartTime > this.context.currentTime) {
                            const chunkDuration = (numBuffers * processorFrames/ this.context.sampleRate);
                            const bufferSource = this.context.createBufferSource();
                            bufferSource.buffer = processorBuffer;

                            bufferSource.connect(destination);
                            bufferSource.start(chunkStartTime);
                            chunkStartTime += chunkDuration;
                        } else {
                            chunkStartTime = this.context.currentTime + bufferingtime;
                        }
                    }
                    setTimeout(() => createAudioChunk(),0);
                };
                this.connected = true;
                setTimeout(() => createAudioChunk(), 0);

            }

            disconnect() {
                this.connected = false;
                console.log('disconnect');
            }
        };

        class AudioWorkletProcessorPolyfill {
            constructor() {
                this.port = {
                    onmessage: function () { },
                    postMessage: function (msg) { },
                    start: function () { },
                    close: function () { }
                };
            }
        };

        class AudioWorkletGlobalScope {
            static registerProcessor(name, processorClass) {
                if (!window.audioWorkletProcessors) {
                    window.audioWorkletProcessors = {};
                }
                window.audioWorkletProcessors[name] = processorClass;
            }
        };

        window.AudioWorkletProcessor = AudioWorkletProcessorPolyfill;
        window.registerProcessor = AudioWorkletGlobalScope.registerProcessor;
        window.AudioWorkletGlobalScope = AudioWorkletGlobalScope;
    }
}

applyPolyfill();