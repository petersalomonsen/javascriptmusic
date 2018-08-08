const Pattern = require('./pattern/pattern.class.js');
const output = require('./midi/output.js');
const RecordedPattern = require('./pattern/recordedpattern.class.js');

global.startTime = Date.now();
global.bpm = 120;
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

const recording1 = new RecordedPattern(output, require('./recordings/recording1.js'));


const DrumPattern = require('./pattern/playable/drumpattern.js');
const drums = new DrumPattern(output);
const BasePattern = require('./pattern/playable/basepattern.js');
const base = new BasePattern(output);
(async function() {
    // recording1.play();
    for(let n = 0; n<2; n++) {
        chord.play(['c4','c6','d#6','g6'], 4);
        await pattern.play(0, 'c5');
        await pattern.play(0, 'c5');
        
        
        chord.play(['d4','a#5','d6'],  4);
        chord.play(['f6'],  8);
        await pattern.play(2, 'a#4');
        await pattern.play(2, 'a#4');
        
        
        chord.play(['f4','g#6','c6'],  4);
        await pattern.play(0, 'f5');
        await pattern.play(0, 'f5');
        
        
        chord.play(['d#4','d#6','g6','a#6'], 4);
        await pattern.play(2, 'd#5');
        await pattern.play(2, 'd#5');
        
        
        chord.play(['g#4','d#6','g#6','c7'], 4);        
        await pattern.play(1, 'g#5');
        await pattern.play(1, 'g#5');

        
        chord.play(['c4','g6','c7','d#7'], 4);
     
        await pattern.play(5, 'c6');
        await pattern.play(5, 'c6');

        chord.play(['a#3','f6','a#6'], 8);
        chord.play(['d#7'], 4);
        await pattern.play(6, 'a#5');
        await pattern.play(6, 'a#5');

        chord.play(['d7'], 4);

        await pattern.play(4, 'a#5');
        await pattern.play(4, 'a#5');                
    }
        
    drums.play();
    
    chord.play(['g#4','g#6','c7','d#7'], 4);
    await chord.waitDuration(4);

        
    drums.play();
        
    chord.play(['c4','g6','c7','d#7'], 4);
    await chord.waitDuration(4);

    drums.play();
    
    chord.play(['a#3','a#6'], 8);
    chord.play(['g6','d#7'], 4);
    await chord.waitDuration(4);

    drums.play();
    
    chord.play(['f6','d7'], 4);
    await chord.waitDuration(4);    
})();