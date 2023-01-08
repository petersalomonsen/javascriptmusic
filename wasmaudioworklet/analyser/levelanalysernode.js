
export async function connectLevelAnalyser(audioNode) {
    await audioNode.context.audioWorklet.addModule(new URL('levelanalyserprocessor.js', import.meta.url));
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

export function skipClipsWithinCentiSeconds(cliparray) {
    return cliparray.reduce((newarr, curr) => {
        if (newarr.length == 0 ||
            Math.round(curr.time * 100) !=  Math.round(newarr[newarr.length-1].time * 100) ) {
            newarr.push(curr);
        }
        return newarr;
    }, []);
}