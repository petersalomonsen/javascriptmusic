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
console.log(outputIndex);
// Send a MIDI message.
output.sendMessage([0x90,0x46,0x7f]);

// Close the port when done.
output.closePort();