module.exports = function(recordingFileName) {
    const midi = require('midi');

    // create a readable stream
    var stream1 = midi.createReadStream();
    var input = new midi.input();

    let inputIndex;

    for(var n=0;n<input.getPortCount(); n++) {
        if(input.getPortName(n) === 'K-Board' || input.getPortName(n).indexOf('UM-1')===0) {
                
            inputIndex = n;
        }
    }

    console.log("Opening",input.getPortName(inputIndex));
    // createReadStream also accepts an optional `input` param

    input.openPort(inputIndex);
    const midimessages = [];

    let previousTime = new Date().getTime();

    input.on('message', (deltatime, msg) => {
        
            const now = new Date().getTime();
            midimessages.push([
                now - previousTime
                , msg]);
            previousTime = now;
            console.log(msg);
    });

    global.shutdownhooks.push(() => {
        if(midimessages.length > 0) {
            console.log("Store recording");
            
            for(let n=0;n<midimessages.length;n++) {
                midimessages[n][0]/=1000;        
            }            
            require('fs').writeFileSync(recordingFileName, JSON.stringify(midimessages, null, 1));
        }
    });
}
