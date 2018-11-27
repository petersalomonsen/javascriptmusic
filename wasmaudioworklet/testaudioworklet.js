// The code in the main global scope.
window.startaudio = async () => {        
    const bytes = await fetch('test.wasm').then(response =>
        response.arrayBuffer()
    );
      
    let context = new AudioContext();
    await context.audioWorklet.addModule('testprocessors.js');
    let testprocessor = new AudioWorkletNode(context, 'my-worklet-processor');
    console.log(testprocessor);
    // testprocessor.port.onmessage = (d) => console.log(d.data);
    testprocessor.port.start();
    testprocessor.port.postMessage({ topic: "wasm", wasm: bytes},bytes);
    testprocessor.connect(context.destination);
};