
export async function connectLevelAnalyser(audioNode) {
    await audioNode.context.audioWorklet.addModule('./analyser/levelanalyserprocessor.js');
    const levelAnalyserNode = new AudioWorkletNode(audioNode.context, 'levelanalyserprocessor');
    levelAnalyserNode.port.start();
    audioNode.connect(levelAnalyserNode);

    return () => new Promise(resolve => {
        levelAnalyserNode.port.onmessage = (msg) => {
            resolve(msg.data);
        };
        levelAnalyserNode.port.postMessage({ stats: true });
    });
}

