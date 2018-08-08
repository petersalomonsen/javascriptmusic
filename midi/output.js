const midi = require('midi');

// Set up a new output.
const output = new midi.output();
let outputIndex;
for(var n=0;n<output.getPortCount(); n++) {
    if(output.getPortName(n) === 'virtual1' || output.getPortName(n).indexOf("ZynAddSub")===0 ) {
        outputIndex = n;
    }
}
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