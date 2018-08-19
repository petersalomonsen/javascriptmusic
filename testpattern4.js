const Pattern = require('./pattern/pattern.class.js');
const output = require('./midi/output.js');
const recorder = require('./midi/recorder.js');
const RecordedPattern = require('./pattern/recordedpattern.class.js');

const fs = require('fs');

global.startTime = Date.now();
global.bpm = 110;
global.currentBeat = () =>
    ((Date.now() -
        global.startTime)/
        (60*1000)
) * global.bpm; 
                        

const midi = require('midi');

const chord = (new class extends Pattern {
    constructor() {
        super(output);
        this.channel = 2;
        this.velocity = 127;
    }
    async play(notes, duration) {      
        await this.waitForBeat(Math.round(global.currentBeat()));       
        notes.forEach(note => this.playNote(note, duration));    
    };
});

const Arpeggiator = new require('./pattern/playable/arpeggiato1.js');
const pattern = new Arpeggiator(output);




const DrumPattern = require('./pattern/playable/drumpattern.js');
const drums = new DrumPattern(output);
const BasePattern = require('./pattern/playable/basepattern.js');
const base = new BasePattern(output);

recorder('./recordings/recording4.json');

(async function() {
    try {
       new RecordedPattern(output, JSON.parse(fs.readFileSync('./recordings/recording2.json'))
                    .map(e => {
                        e[1][2] /= 3;
                        return e;
                    })).play();
       new RecordedPattern(output, JSON.parse(fs.readFileSync('./recordings/recording3.json'))).play();
       new RecordedPattern(output, JSON.parse(fs.readFileSync('./recordings/recording4.json'))).play();
    } catch(e) {}
    
    while(true) {        
        await drums.play('baseandhihats');
    }
   
})();