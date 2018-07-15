const midi = require('midi');

// create a readable stream
var stream1 = midi.createReadStream();
var input = new midi.input();

let inputIndex;

for(var n=0;n<input.getPortCount(); n++) {
    if(input.getPortName(n) === 'K-Board') {
        inputIndex = n;
    }
}
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
});

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    for(let n=0;n<midimessages.length;n++) {
        midimessages[n][0]/=1000;        
    }
    require('fs').writeFileSync('recording.json', JSON.stringify(midimessages, null, 1));
    process.exit();

});