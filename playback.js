const midi = require('midi');

// Set up a new output.
const output = new midi.output();
let outputIndex;
for(var n=0;n<output.getPortCount(); n++) {
    if(output.getPortName(n) === 'virtual1') {
        outputIndex = n;
    }
}
output.openPort(outputIndex);

const midimessages = JSON.parse(require('fs').readFileSync('recording.json'));

const playEvent = (msg) => {
    if(msg) {
        output.sendMessage(msg);
    }

    if(midimessages.length>0) {
        const evt = midimessages.shift();
        const deltatime = evt[0];
        const nextmessage = evt[1];        
        
        setTimeout(() => playEvent(nextmessage), deltatime * 1000);
    }
};

playEvent();
setInterval(()=> output.sendMessage([0x91, 0x24, 127]), 600);