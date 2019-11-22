import { writeMod, cmd } from './protrackermodwriter.js';
import { createSamples } from './instrumentgenerator.js';
import { createSampleEcho, insertNotesIntoPattern, insertSampleNotesIntoPattern } from './lib/patterntools.js';

const samples = createSamples('./build/index.wasm', [
    (instance) => {
        instance.setChannelValue(0, 69 - (12 ));
        instance.fillSampleBuffer();

        return {
                samplename: "bass",
                funcname: "bass",
                finetune: 0,
                volume: 64,
                loopstart: 0xf1e,
                looplength: 512
            };
    },
    (instance) => {
        instance.setChannelValue(1, 69 + (12));
        instance.fillSampleBuffer();
        return {
                samplename: "lead",
                funcname: "lead",
                finetune: 0,
                volume: 40,
                loopstart: 0x6ea,
                looplength: 0x1600
            };
    },
    (instance) => {
        instance.setChannelValue(2, 100);
        instance.fillSampleBuffer();
        return {
            samplename: "kick",
            funcname: "kick",
            finetune: 0,
            volume: 64,
            loopstart: 0,
            looplength: 0
        };        
    },
    (instance) => {
        instance.setChannelValue(2, 100);
        instance.setChannelValue(3, 35);
        instance.setChannelValue(4, 30);
        instance.fillSampleBuffer();
        return {
            samplename: "kickandsnare",
            funcname: "kickandsnare",
            finetune: 0,
            volume: 64,
            loopstart: 0,
            looplength: 0
        };        
    },
    (instance) => {
        instance.setChannelValue(2, 100);
        instance.setChannelValue(4, 30);
        instance.fillSampleBuffer();
        return {
            samplename: "kickandhihat",
            funcname: "kickandhihat",
            finetune: 0,
            volume: 64,
            loopstart: 0,
            looplength: 0
        };        
    },
    (instance) => {
        instance.setChannelValue(3, 100);
        instance.fillSampleBuffer();
        return {
            samplename: "snare",
            funcname: "snare",
            finetune: 0,
            volume: 40,
            loopstart: 0,
            looplength: 0
        };        
    },
    (instance) => {
        instance.setChannelValue(4, 100);
        instance.fillSampleBuffer();
        return {
            samplename: "hihat",
            funcname: "hihat",
            finetune: 0,
            volume: 40,
            loopstart: 0,
            looplength: 0
        };        
    },
    (instance) => {
        instance.setChannelValue(5, 69 + (12));
        instance.fillSampleBuffer();
        return {
            samplename: "synthbrasslead",
            funcname: "synthbrasslead",
            finetune: 0,
            volume: 25,
            loopstart: 0,
            looplength: 0
        };        
    },
    (instance) => {
        instance.setChannelValue(6, 69 + (12));
        instance.setChannelValue(7, 69 + (12) +3 );
        instance.setChannelValue(8, 69 + (12) + 7 );
        instance.fillSampleBuffer();
        return {
            samplename: "minorchord",
            funcname: "minorchord",
            finetune: 0,
            volume: 25,
            loopstart: 0,
            looplength: 0x2000
        };        
    },
    (instance) => {
        instance.setChannelValue(6, 69 + (12));
        instance.setChannelValue(7, 69 + (12) + 4 );
        instance.setChannelValue(8, 69 + (12) + 7 );
        instance.fillSampleBuffer();
        return {
            samplename: "majorchord",
            funcname: "majorchord",
            finetune: 0,
            volume: 25,
            loopstart: 0,
            looplength: 0x2000
        };        
    },
    (instance) => {
        instance.setChannelValue(6, 69 + (12));
        instance.setChannelValue(7, 69 + (12) + 4 );
        instance.setChannelValue(8, 69 + (12) + 9 );
        instance.fillSampleBuffer();
        return {
            samplename: "minorchord2",
            funcname: "minorchord2",
            finetune: 0,
            volume: 25,
            loopstart: 0,
            looplength: 0x2000
        };        
    },
    (instance) => {
        instance.setChannelValue(6, 69 + (12));
        instance.setChannelValue(7, 69 + (12) + 3 );
        instance.setChannelValue(8, 69 + (12) + 8 );
        instance.fillSampleBuffer();
        return {
            samplename: "majorchord2",
            funcname: "majorchord2",
            finetune: 0,
            volume: 25,
            loopstart: 0,
            looplength: 0x2000
        };        
    }
]);


const patternwithpad = [
    bass(a1, 0x0a, 0x0c),minorchord(a2),,kickandhihat(a3, 0, 0),
    ,,,hihat(a3, 0x0c, 0x10),
    ,,,hihat(a3, 0x0c, 0x30),
    ,,,hihat(a3, 0x0c, 0x10),
    bass(a1, 0x0a, 0x0c),,,kickandhihat(a3, 0, 0),
    ,,,hihat(a3, 0x0c, 0x10),
    ,,,hihat(a3, 0x0c, 0x30),
    bass(f1, 0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
    ,majorchord2(a2),,kickandhihat(a3, 0, 0),
    ,,,hihat(a3, 0x0c, 0x10),
    bass(f1, 0x0a, 0x0c),,,hihat(a3, 0x0c, 0x30),
    ,majorchord2(a2),,hihat(a3, 0x0c, 0x10),
    ,,,kickandhihat(a3, 0, 0),
    ,,,hihat(a3, 0x0c, 0x10),
    bass(f1, 0x0a, 0x0c),,,hihat(a3, 0x0c, 0x30),
    ,,,hihat(a3, 0x0c, 0x10),
    bass(g1, 0x0a, 0x0c),majorchord(g2),,kickandhihat(a3, 0, 0),
    ,,,hihat(a3, 0x0c, 0x10),
    ,,,hihat(a3, 0x0c, 0x30),
    ,,,hihat(a3, 0x0c, 0x10),
    bass(g1, 0x0a, 0x0c),,,kickandhihat(a3, 0, 0),
    ,,,hihat(a3, 0x0c, 0x10),
    ,,,hihat(a3, 0x0c, 0x30),
    bass(e1, 0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
    ,minorchord2(g2),,kickandhihat(a3, 0, 0),
    ,,,hihat(a3, 0x0c, 0x10),
    bass(e1, 0x0a, 0x0c),,,hihat(a3, 0x0c, 0x30),
    ,,,hihat(a3, 0x0c, 0x10),
    ,,,kickandhihat(a3, 0, 0),
    ,,,hihat(a3, 0x0c, 0x10),
    ,,,hihat(a3, 0x0c, 0x30),
    ,,,hihat(a3, 0x0c, 0x10),

    bass(a1, 0x0a, 0x0c),minorchord(a2),lead(e2),kickandhihat(a3, 0, 0),
    ,,,hihat(a3, 0x0c, 0x10),
    ,,,hihat(a3, 0x0c, 0x30),
    ,,,hihat(a3, 0x0c, 0x10),
    bass(a1, 0x0a, 0x0c),,lead(a2),kickandhihat(a3, 0, 0),
    ,,,hihat(a3, 0x0c, 0x10),
    ,,lead(g2),hihat(a3, 0x0c, 0x30),
    bass(f1, 0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
    ,majorchord2(a2),lead(f2),kickandhihat(a3, 0, 0),
    ,,,hihat(a3, 0x0c, 0x10),
    bass(f1, 0x0a, 0x0c),,lead(e2),hihat(a3, 0x0c, 0x30),
    ,majorchord2(a2),,hihat(a3, 0x0c, 0x10),
    ,,,kickandhihat(a3, 0, 0),
    ,,,hihat(a3, 0x0c, 0x10),
    bass(f1, 0x0a, 0x0c),,lead(d2),hihat(a3, 0x0c, 0x30),
    ,,,hihat(a3, 0x0c, 0x10),
    bass(g1, 0x0a, 0x0c),majorchord(g2),,kickandhihat(a3, 0, 0),
    ,,,hihat(a3, 0x0c, 0x10),
    ,,lead(g2),hihat(a3, 0x0c, 0x30),
    ,,,hihat(a3, 0x0c, 0x10),
    bass(g1, 0x0a, 0x0c),,,kickandhihat(a3, 0, 0),
    ,,,hihat(a3, 0x0c, 0x10),
    ,,lead(e2),hihat(a3, 0x0c, 0x30),
    bass(e1, 0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
    ,minorchord2(g2),,kickandhihat(a3, 0, 0),
    ,,,hihat(a3, 0x0c, 0x10),
    bass(e1, 0x0a, 0x0c),,,hihat(a3, 0x0c, 0x30),
    ,,,snare(a3, 0x0c, 0x30),
    ,,,kickandsnare(a3, 0, 0),
    ,,,hihat(a3, 0x0c, 0x10),
    ,,,hihat(a3, 0x0c, 0x30),
    ,,,hihat(a3, 0x0c, 0x10),
];

insertNotesIntoPattern(synthbrasslead, patternwithpad, 0, 2, [
    b2(1,3),cmd(6,0x62),b2,,a2,,g2,a2,,,
    e2,,d2,c2,,,
    d2,,d2,,c2,d2,,
    e2,,,g2,e2
]);

const patternwithpadandsnare = patternwithpad.map((note,ndx) => {
    if(ndx % 32 === 19) {
        return kickandsnare(a3);
    } else if(ndx >= 32 * 4 && ndx % 4 !== 3 ) {
        // clear second half of pattern except drums
        return [];
    } else {
        return note;
    }

});

createSampleEcho(patternwithpad,
    samples.findIndex(sample => sample.samplename === 'synthbrasslead') + 1,
    3, 12, 8, [0,2]);

insertNotesIntoPattern(bass, patternwithpadandsnare,32, 0, [
    d1,cmd(10, 12),,d2(10, 12),
    ,d2(10,12),,d2,
    d1,,cmd(10,12),c2,
    ,d2(10,12),d1,cmd(10,12),
    g1,cmd(10, 12),,g2(10, 12),
    ,g2(10,12),,g2,
    g1,,cmd(10,12),d2,
    ,g2(10,12),g1,cmd(10,12),,
]);

insertNotesIntoPattern(synthbrasslead, patternwithpadandsnare, 32, 2, [
    ,,,,,e2,a2,b2,c3,b2,,a2,,g2,,a2(1,3),b2(3,30),cmd(4,0x64)
]);

insertSampleNotesIntoPattern(patternwithpadandsnare, 56, 3, [
    kickandhihat(a3),
    snare(a3,0x0c,20),
    snare(a3),
    hihat(a3, 0x0c, 0x30),
    kickandsnare(a3),
    hihat(a3, 0x0c, 0x30),
    snare(a3, 0x0c, 0x20),
    snare(a3),
]);

createSampleEcho(patternwithpadandsnare,
    samples.findIndex(sample => sample.samplename === 'synthbrasslead') + 1,
    3, 12, 8, [0,2]);

patternwithpadandsnare[32 * 4 + 1 ] = minorchord(d2 , 0, 0);
patternwithpadandsnare[48 * 4 + 1 ] = majorchord(g2 , 0, 0);

const moduledef = {
    songname: "hello song",
    samples: samples,
    songpositions: [
        // patterns to play  
        // 3,
        // 4,
        0,
        1,
        2,
        2,
        3,
        4
    ],
    patterns: [
        [
            // instrument, period, command, value
            bass(a1, 0x0a, 0x0c),lead(c2, 0, 0),lead(e2, 0, 0),kick(a3, 0, 0),
            ,,,,
            bass(a1, 0x0a, 0x0c),,,,
            bass(a2, 0x0a, 0x0c),,,,
            ,,,kick(a3, 0, 0),
            bass(a2, 0x0a, 0x0c),,,,
            bass(a1, 0x0a, 0x0c),,,,
            bass(g1, 0x0a, 0x0c),,,,
            bass(f1),,,kick(a3, 0, 0),
            ,,,,
            ,,,lead(e2, 0, 0),
            bass(f2, 0x0a, 0x0c),,,,
            ,,lead(a2, 0, 0),kick(a3, 0, 0),
            bass(f2, 0x0a, 0x0c),,,,
            bass(f1, 0x0a, 0x0c),,,lead(c3, 0, 0),
            ,,,,
            bass(g1),lead(d2, 0, 0),lead(b2, 0, 0),kick(a3, 0, 0),
            ,,,,
            ,,,lead(g2, 0, 0),
            bass(g2, 0x0a, 0x0c),,,,
            ,,lead(d2, 0, 0),kick(a3, 0, 0),
            bass(g2, 0x0a, 0x0c),,,,
            bass(g1, 0x0a, 0x0c),,,lead(e2, 0, 0),
            ,,,kick(a3, 0x0c, 20),
            bass(e1),lead(b1, 0, 0),,kick(a3, 0, 0),
            ,,,,
            bass(e2, 0x0a, 0x0c),,,lead(g2, 0, 0),
            bass(e1, 0x0c, 0x20),,,,
            bass(g1),,,kick(a3, 0, 0),
            ,,lead(a2, 0, 0),,
            bass(g2),,,,
            bass(g1),,,,

            bass(a1, 0x0a, 0x0c),lead(c2, 0, 0),lead(e2, 0, 0),kick(a3, 0, 0),
            ,,,,
            bass(a1, 0x0a, 0x0c),,,,
            bass(a2, 0x0a, 0x0c),,,,
            ,,,kick(a3, 0, 0),
            bass(a2, 0x0a, 0x0c),,,,
            bass(a1, 0x0a, 0x0c),,,,
            bass(g1, 0x0a, 0x0c),,,,
            bass(f1),,,kick(a3, 0, 0),
            ,,,,
            ,,,lead(e2, 0, 0),
            bass(f2, 0x0a, 0x0c),,,,
            ,,lead(a2, 0, 0),kick(a3, 0, 0),
            bass(f2, 0x0a, 0x0c),,,,
            bass(f1, 0x0a, 0x0c),,,lead(c3, 0, 0),
            ,,,,
            bass(g1),lead(d2, 0, 0),lead(b2, 0, 0),kick(a3, 0, 0),
            ,,,,
            ,,,lead(g2, 0, 0),
            bass(g2, 0x0a, 0x0c),,,,
            ,,lead(d2, 0, 0),kick(a3, 0, 0),
            bass(g2, 0x0a, 0x0c),,,,
            bass(g1, 0x0a, 0x0c),,,lead(e2, 0, 0),
            ,,,kick(a3, 0x0c, 20),
            bass(e1),lead(b1, 0, 0),,kick(a3, 0, 0),
            ,,,,
            bass(e2, 0x0a, 0x0c),,,lead(g2, 0, 0),
            bass(e1, 0x0c, 0x20),,,,
            bass(g1),,,kick(a3, 0, 0),
            ,,lead(a2, 0, 0),,
            bass(g2),,,,
            bass(g1),,,,
        ],
        [
            // Pattern 2
            // instrument, period, command, value
            bass(a1, 0x0a, 0x0c),lead(c2, 0, 0),lead(e2, 0, 0),kick(a3, 0, 0),
            ,,,,
            bass(a1, 0x0a, 0x0c),,,,
            bass(a2, 0x0a, 0x0c),,,,
            snare(a3),,,kick(a3, 0, 0),
            bass(a2, 0x0a, 0x0c),,,,
            bass(a1, 0x0a, 0x0c),,,,
            bass(g1, 0x0a, 0x0c),,,,
            bass(f1),,,kick(a3, 0, 0),
            ,,,,
            ,,,lead(e2, 0, 0),
            bass(f2, 0x0a, 0x0c),,,,
            snare(a3),,lead(a2, 0, 0),kick(a3, 0, 0),
            bass(f2, 0x0a, 0x0c),,,,
            bass(f1, 0x0a, 0x0c),,,lead(c3, 0, 0),
            ,,,,
            bass(g1),lead(d2, 0, 0),lead(b2, 0, 0),kick(a3, 0, 0),
            ,,,,
            ,,,lead(g2, 0, 0),
            bass(g2, 0x0a, 0x0c),,,,
            snare(a3),,lead(d2, 0, 0),kick(a3, 0, 0),
            bass(g2, 0x0a, 0x0c),,,,
            bass(g1, 0x0a, 0x0c),,,lead(e2, 0, 0),
            ,,,kick(a3, 0x0c, 20),
            bass(e1),lead(b1, 0, 0),,kick(a3, 0, 0),
            ,,,,
            bass(e2, 0x0a, 0x0c),,,lead(g2, 0, 0),
            bass(e1, 0x0c, 0x20),,,,
            bass(g1),snare(a3),,kick(a3, 0, 0),
            ,,lead(a2, 0, 0),,
            bass(g2),,,,
            bass(g1),,snare(a3, 0x0c, 20),,

            bass(a1, 0x0a, 0x0c),lead(c2, 0, 0),lead(e2, 0, 0),kick(a3, 0, 0),
            ,,,,
            bass(a1, 0x0a, 0x0c),,,,
            bass(a2, 0x0a, 0x0c),,,,
            snare(a3),,,kick(a3, 0, 0),
            bass(a2, 0x0a, 0x0c),,,,
            bass(a1, 0x0a, 0x0c),,,,
            bass(g1, 0x0a, 0x0c),,,,
            bass(f1),,,kick(a3, 0, 0),
            ,,,,
            ,,,lead(e2, 0, 0),
            bass(f2, 0x0a, 0x0c),,,,
            snare(a3),,lead(a2, 0, 0),kick(a3, 0, 0),
            bass(f2, 0x0a, 0x0c),,,,
            bass(f1, 0x0a, 0x0c),,,lead(c3, 0, 0),
            ,,,,
            bass(g1),lead(d2, 0, 0),lead(b2, 0, 0),kick(a3, 0, 0),
            ,,,,
            ,,,lead(g2, 0, 0),
            bass(g2, 0x0a, 0x0c),,,,
            snare(a3),,lead(d2, 0, 0),kick(a3, 0, 0),
            bass(g2, 0x0a, 0x0c),,,,
            bass(g1, 0x0a, 0x0c),,,lead(e2, 0, 0),
            ,,,kick(a3, 0x0c, 20),
            bass(e1),lead(b1, 0, 0),,kick(a3, 0, 0),
            ,,,,
            bass(e2, 0x0a, 0x0c),,,lead(g2, 0, 0),
            bass(e1, 0x0c, 0x20),,,snare(a3,0x0c, 20),
            bass(g1),snare(a3),,kick(a3, 0, 0),
            ,,lead(a2, 0, 0),,
            bass(g2),,,snare(a3,0x0c, 20),
            bass(g1),,,snare(a3,0x0c, 30),
        ],
        [
            // Pattern 3
            // instrument, period, command, value
            bass(a1, 0x0a, 0x0c),synthbrasslead(ds3, 1, 2),lead(c2, 0, 0),kick(a3, 0, 0),
            ,cmd(4,0x51),,,
            bass(a1, 0x0a, 0x0c),cmd(4,0x51),,,
            bass(a2, 0x0a, 0x0c),cmd(4,0x51),,,
            snare(a3),,synthbrasslead(d3),kick(a3, 0, 0),
            bass(a2, 0x0a, 0x0c),,,,
            bass(a1, 0x0a, 0x0c),,,,
            bass(g1, 0x0a, 0x0c),,synthbrasslead(c3),,
            bass(f1),,,kick(a3, 0, 0),
            ,,synthbrasslead(a2),,
            ,,,lead(e2, 0, 0),
            bass(f2, 0x0a, 0x0c),synthbrasslead(a2),,,
            snare(a3),synthbrasslead(b2),lead(a2, 0, 0),kick(a3, 0, 0),
            bass(f2, 0x0a, 0x0c),,,,
            bass(f1, 0x0a, 0x0c),,synthbrasslead(c3),lead(c3, 0, 0),
            ,,,,
            bass(g1),synthbrasslead(d3, 0, 0),lead(b2, 0, 0),kick(a3, 0, 0),
            ,,,,
            ,,,lead(g2, 0, 0),
            bass(g2, 0x0a, 0x0c),,,,
            snare(a3),synthbrasslead(c3, 0, 0),lead(d2, 0, 0),kick(a3, 0, 0),
            bass(g2, 0x0a, 0x0c),,,,
            bass(g1, 0x0a, 0x0c),,,lead(e2, 0, 0),
            ,,,kick(a3, 0x0c, 20),
            bass(e1),lead(b1, 0, 0),synthbrasslead(b2, 0, 0),kick(a3, 0, 0),
            ,,,synthbrasslead(c3, 0, 0),
            bass(e2, 0x0a, 0x0c),synthbrasslead(b2, 0, 0),,lead(g2, 0, 0),
            bass(e1, 0x0c, 0x20),synthbrasslead(a2, 0, 0),,,
            bass(g1),snare(a3),,kick(a3, 0, 0),
            ,,lead(a2, 0, 0),synthbrasslead(g2, 0, 0),
            bass(g2),,,,
            bass(g1),synthbrasslead(e2, 0, 0),snare(a3, 0x0c, 20),,

            bass(a1, 0x0a, 0x0c),lead(c2, 0, 0),lead(e2, 0, 0),kick(a3, 0, 0),
            ,,,,
            bass(a1, 0x0a, 0x0c),,,,
            bass(a2, 0x0a, 0x0c),,,,
            snare(a3),,,kick(a3, 0, 0),
            bass(a2, 0x0a, 0x0c),,,,
            bass(a1, 0x0a, 0x0c),,,,
            bass(g1, 0x0a, 0x0c),,,,
            bass(f1),,,kick(a3, 0, 0),
            ,,,,
            ,,,lead(e2, 0, 0),
            bass(f2, 0x0a, 0x0c),,,,
            snare(a3),,lead(a2, 0, 0),kick(a3, 0, 0),
            bass(f2, 0x0a, 0x0c),,,,
            bass(f1, 0x0a, 0x0c),,,lead(c3, 0, 0),
            ,,,,
            bass(g1),synthbrasslead(d2, 0, 0),lead(b2, 0, 0),kick(a3, 0, 0),
            ,,,synthbrasslead(g2, 0, 0),
            ,,,lead(g2, 0, 0),
            bass(g2, 0x0a, 0x0c),,,,
            snare(a3),,lead(d2, 0, 0),kick(a3, 0, 0),
            bass(g2, 0x0a, 0x0c),,,,
            bass(g1, 0x0a, 0x0c),,,lead(e2, 0, 0),
            ,,,kick(a3, 0x0c, 20),
            bass(e1),lead(b1, 0, 0),,kick(a3, 0, 0),
            ,,,,
            bass(e2, 0x0a, 0x0c),,,lead(g2, 0, 0),
            bass(e1, 0x0c, 0x20),,,snare(a3,0x0c, 20),
            bass(g1),snare(a3),,kick(a3, 0, 0),
            ,,synthbrasslead(e2, 0, 0),,
            bass(g2),,synthbrasslead(a2, 0, 0),snare(a3,0x0c, 20),
            bass(g1),,synthbrasslead(b2, 0, 0),snare(a3,0x0c, 30),
        ],
        patternwithpad,
        patternwithpadandsnare
    ]
};

createSampleEcho(moduledef.patterns[2],
    samples.findIndex(sample => sample.samplename === 'synthbrasslead') + 1,
    3, 18, 8, [0,1,2,3]);

writeMod('test.mod', moduledef);