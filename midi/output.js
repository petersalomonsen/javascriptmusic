const midi = require('midi');

// Set up a new output.
const output = new midi.output();
let outputIndex;
for(var n=0;n<output.getPortCount(); n++) {
    if(output.getPortName(n) === 'virtual1' || output.getPortName(n).indexOf("yoshimi")===0 || output.getPortName(n).indexOf("ZynAddSub")===0 ) {
        outputIndex = n;
    }
}
output._sendMessage = output.sendMessage;
output.mute = (channels) => {
    output.muted = channels;
};
output.solo = (channels) => {
    output.soloed = channels;
};
output.sendMessage = (msg) => {
    if(output.muted && output.muted.findIndex((channel) => (msg[0] & 0xf) === channel) > -1) {

        // Muted - do nothing
    } else if(!output.soloed || output.soloed.findIndex((channel) => (msg[0] & 0xf) === channel) > -1){
        output._sendMessage(msg);
    }
};

output.openPort(outputIndex);

global.shutdownhooks = [
    () => {
        console.log("All notes off");
        for(let n=0;n<16;n++) {
            output.sendMessage([0xb0 + n, 123, 0]);
        }
    }
];
process.on('SIGINT', function() {
    global.shutdownhooks.forEach(shutdownhook => {
        shutdownhook();
    });    
    process.exit();

});

module.exports = output;