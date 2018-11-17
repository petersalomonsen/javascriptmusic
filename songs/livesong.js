const output = require('../midi/output.js');
const TrackerPattern = require('../pattern/trackerpattern.class.js');
const RecordConverter = require('../pattern/recordconverter.js');
global.bpm = 120;

if(require('../tools/livecodingscheduler').enableLiveRestart()) {
    console.log('livereload');
    return;
}

const Recorder = require('../midi/recorder.class.js');
const recorder = new Recorder(11, output);

const drums = new TrackerPattern(output, 1, 4);
drums.play([
    controlchange(7, 120, 120)
]);

const rhodes = new TrackerPattern(output, 0, 4);
rhodes.play([controlchange(7, 95), controlchange(10, 40), controlchange(11, 100)]);

const pad = new TrackerPattern(output, 2, 4);
pad.play([controlchange(7, 105, 105), controlchange(10, 72, 72)]);

const strings = new TrackerPattern(output, 6, 4);
strings.play([controlchange(7, 55), controlchange(10, 35)]);

const lead = new TrackerPattern(output, 8, 4);
lead.play([controlchange(7, 105), controlchange(10, 70)]);

const lead2 = new TrackerPattern(output, 5, 4);
lead2.play([controlchange(7, 120), controlchange(11, 110), controlchange(10, 80)]);

const base = new TrackerPattern(output, 7, 4);
base.play([controlchange(7, 70), controlchange(11, 65)]);

const lead3 = new TrackerPattern(output, 11, 4);
lead3.play([controlchange(7, 120), controlchange(11, 120)]);

const subdelaylead = new TrackerPattern(output, 10, 4);
subdelaylead.play([
    controlchange(7, 127),
    controlchange(11, 120),
    controlchange(10, 75)]);

(async function() {    
    await waitForFixedStartTime();
    
    while(true) {           
        await new TrackerPattern().play([
            [4, () => drums.steps(1,
                [c3, [c3,d3], c3, [c3,d3]]
                ),
                () => drums.steps(4,
                    [gs3,,gs3(1,60),,
                        gs3,,gs3(1,60),,
                        gs3,,gs3(1,60),,
                        gs3,,gs3(1,60),gs3(1,40)]
                    ),
                () => base.steps(4, [d3,,d4(1/32,70),d4,,d4,d3,,
                    f3,,f4,,c3(1/2),,,cs4(1/16,70)]),
                () => lead.steps(4, [d5,a5,d6,f6,d7,f6,d6,a5,d5]),
                () => lead2.steps(4,
                    [g5,a5(1/2),,,
                        [c6(1), pitchbend(0x1000, 0x2000, 1/2, 8)],
                        ,,,
                        d6(1/2),,c6(1/2, 70)
                    ]),
                () => strings.steps(1, [d5(4), f6(4), d7(4)])
            ]
        ], 1);            
    }
    
})();