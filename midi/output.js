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

process.on('SIGINT', function() {
    console.log("Caught interrupt signal - all notes off");
    for(let n=0;n<16;n++) {
        output.sendMessage([0xb0 + n, 123, 0]);
    }
    
    process.exit();

});

module.exports = output;