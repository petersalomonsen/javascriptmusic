// SONGMODE=PROTRACKER

import { writeMod, cmd, clr } from './lib/protrackermodwriter.js';
import { createSamples } from './lib/instrumentgenerator.js';
import { createSampleEcho, insertNotesIntoPattern, insertSampleNotesIntoPattern, toPatternArray, createEmptyPatternArray } from './lib/patterntools.js';

onmessage = function(msg) {
    const samples = createSamples(msg.data.WASM_SYNTH_BYTES, [
        (instance) => {
            instance.setChannelValue(0, 69 - (12 ));
            instance.fillSampleBuffer();

            return {
                    samplename: "(c) peter salomonsen",
                    funcname: "bass",
                    finetune: 0,
                    volume: 64,
                    loopstart: 0x1000,
                    looptransitionlength: 0x800,
                    looplength: 0x800
                };
        },
        (instance) => {
            instance.setChannelValue(1, 69 + (12));
            instance.fillSampleBuffer();
            return {
                    samplename: "december 2019",
                    funcname: "lead",
                    finetune: 0,
                    volume: 40,
                    loopstart: 0x800,
                    looplength: 0x1600,
                    looptransitionlength: 0x800
                };
        },
        (instance) => {
            instance.setChannelValue(2, 100);
            instance.fillSampleBuffer();
            return {
                samplename: "written in javascript",
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
                samplename: "check out",
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
                samplename: "petersalomonsen.com",
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
                samplename: "for more info",
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
                loopstart: 0x1000,
                looplength: 0x1000,
                looptransitionlength: 0x800
            };        
        },
        (instance) => {
            
            instance.setChannelValue(7, 69 + (12));
            instance.setChannelValue(8, 69 + (12) +3 );
            instance.setChannelValue(9, 69 + (12) + 7 );
            instance.fillSampleBuffer();
            return {
                samplename: "minorchord",
                funcname: "minorchord",
                finetune: 0,
                volume: 40,
                loopstart: 0x800,
                looplength: 0x1000,
                looptransitionlength: 0x800
            };        
        },
        (instance) => {
            
            instance.setChannelValue(7, 69 + (12));
            instance.setChannelValue(8, 69 + (12) + 4 );
            instance.setChannelValue(9, 69 + (12) + 7 );
            instance.fillSampleBuffer();
            return {
                samplename: "majorchord",
                funcname: "majorchord",
                finetune: 0,
                volume: 40,
                loopstart: 0,
                loopstart: 0x800,
                looplength: 0x1000,
                looptransitionlength: 0x800
            };        
        },
        (instance) => {
            
            instance.setChannelValue(7, 69 + (12));
            instance.setChannelValue(8, 69 + (12) + 4 );
            instance.setChannelValue(9, 69 + (12) + 9 );
            instance.fillSampleBuffer();
            return {
                samplename: "minorchord2",
                funcname: "minorchord2",
                finetune: 0,
                volume: 40,
                loopstart: 0x800,
                looplength: 0x1000,
                looptransitionlength: 0x800
            };        
        },
        (instance) => {
            
            instance.setChannelValue(7, 69 + (12));
            instance.setChannelValue(8, 69 + (12) + 3 );
            instance.setChannelValue(9, 69 + (12) + 8 );
            instance.fillSampleBuffer();
            return {
                samplename: "majorchord2",
                funcname: "majorchord2",
                finetune: 0,
                volume: 40,
                loopstart: 0,
                loopstart: 0x800,
                looplength: 0x1000,
                looptransitionlength: 0x800
            };        
        },
        (instance) => {
            instance.setChannelValue(5, 69 + (12));
            instance.setChannelValue(1, 69 + (24));
            instance.fillSampleBuffer();
            return {
                samplename: "combinedlead",
                funcname: "combinedlead",
                finetune: 0,
                volume: 40,
                loopstart: 0,
                loopstart: 0x400,
                looplength: 0x400,
                looptransitionlength: 0x400
            };        
        },
    ]);


    const patternwithpad = toPatternArray([
        bass(a1),,,kickandhihat(a3, 0, 0),
        cmd(0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
        ,,,hihat(a3, 0x0c, 0x30),
        ,,,hihat(a3, 0x0c, 0x10),
        bass(a1),,,kickandhihat(a3, 0, 0),
        cmd(0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
        ,,,hihat(a3, 0x0c, 0x30),
        bass(f1),,,hihat(a3, 0x0c, 0x10),
        ,,,kickandhihat(a3, 0, 0),
        cmd(0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
        bass(f1),,,hihat(a3, 0x0c, 0x30),
        cmd(0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
        ,,,kickandhihat(a3, 0, 0),
        ,,,hihat(a3, 0x0c, 0x10),
        bass(f1),,,hihat(a3, 0x0c, 0x30),
        cmd(0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
        bass(g1),,,kickandhihat(a3, 0, 0),
        ,,,hihat(a3, 0x0c, 0x10),
        cmd(0x0a, 0x0c),,,hihat(a3, 0x0c, 0x30),
        ,,,hihat(a3, 0x0c, 0x10),
        bass(g1),,,kickandhihat(a3, 0, 0),
        cmd(0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
        ,,,hihat(a3, 0x0c, 0x30),
        bass(e1),,,hihat(a3, 0x0c, 0x10),
        ,,,kickandhihat(a3, 0, 0),
        cmd(0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
        bass(e1),,,hihat(a3, 0x0c, 0x30),
        cmd(0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
        ,,,kickandhihat(a3, 0, 0),
        ,,,hihat(a3, 0x0c, 0x10),
        ,,,hihat(a3, 0x0c, 0x30),
        ,,,hihat(a3, 0x0c, 0x10),

        bass(a1),,lead(e2),kickandhihat(a3, 0, 0),
        ,,,hihat(a3, 0x0c, 0x10),
        cmd(0x0a, 0x0c),,,hihat(a3, 0x0c, 0x30),
        ,,,hihat(a3, 0x0c, 0x10),
        bass(a1),,lead(a2),kickandhihat(a3, 0, 0),
        cmd(0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
        ,,lead(g2),hihat(a3, 0x0c, 0x30),
        bass(f1),,,hihat(a3, 0x0c, 0x10),
        ,,lead(f2),kickandhihat(a3, 0, 0),
        cmd(0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
        bass(f1),,lead(e2),hihat(a3, 0x0c, 0x30),
        cmd(0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
        ,,,kickandhihat(a3, 0, 0),
        ,,,hihat(a3, 0x0c, 0x10),
        bass(f1),,lead(d2),hihat(a3, 0x0c, 0x30),
        cmd(0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
        bass(g1),,,kickandhihat(a3, 0, 0),
        ,,,hihat(a3, 0x0c, 0x10),
        cmd(0x0a, 0x0c),,lead(g2),hihat(a3, 0x0c, 0x30),
        ,,,hihat(a3, 0x0c, 0x10),
        bass(g1),,,kickandhihat(a3, 0, 0),
        cmd(0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
        ,,lead(e2),hihat(a3, 0x0c, 0x30),
        bass(e1),,,hihat(a3, 0x0c, 0x10),
        ,,,kickandhihat(a3, 0, 0),
        cmd(0x0a, 0x0c),,,hihat(a3, 0x0c, 0x10),
        bass(e1),,,hihat(a3, 0x0c, 0x30),
        cmd(0x0a, 0x0c),,,snare(a3, 0x0c, 0x30),
        ,,,kickandsnare(a3, 0, 0),
        ,,,hihat(a3, 0x0c, 0x10),
        ,,,hihat(a3, 0x0c, 0x30),
        ,,,hihat(a3, 0x0c, 0x10),
    ]).insertSampleNotes(0, 1, [
        minorchord(a2,0xc,30),,cmd(0xa,0xc),,
        minorchord(a2,0xc,30),cmd(0xa,0xc),,majorchord2(a2,0xc,30),
        ,cmd(0xa,0xc),majorchord2(a2,0xc,30),cmd(0xa,0xc),
        ,,majorchord2(a2,0xc,30),,
        majorchord(g2,0xc,30),,cmd(0xa,0xc),,
        majorchord(g2,0xc,30),cmd(0xa,0xc),,minorchord2(g2,0xc,30),
        ,cmd(0xa,0xc),minorchord2(g2,0xc,30),cmd(0xa,0xc),
        ,,minorchord2(g2,0xc,30),,
        
    ].repeat(1));

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

    const chordpattern = [
        minorchord(d2, 0xa, 0xc),minorchord(d2, 0xa, 0xc),,minorchord(d2, 0xa, 0xc),
        ,,minorchord(d2),,
        cmd(0x0a, 0x0c),minorchord(d2),,,
        cmd(0x0a, 0x0c),minorchord(d2, 0xa, 0xc)
    ];

    insertSampleNotesIntoPattern(patternwithpadandsnare,32,1,chordpattern);
    insertSampleNotesIntoPattern(patternwithpadandsnare,48,1,chordpattern.map(cell => {
        if(cell && cell[0] > 0) {
            cell = majorchord(g2, cell[2], cell[3]);
        }
        return cell;
    }));


    const patternwithlead = [
        bass(a1, 0x0a, 0x0c),lead(c2, 0, 0),synthbrasslead(ds3, 1, 2),kick(a3, 0, 0),
        ,cmd(4,0x51),,,
        bass(a1, 0x0a, 0x0c),,cmd(4,0x51),,
        bass(a2, 0x0a, 0x0c),,cmd(4,0x51),,
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
        ,,,,
        bass(g2),,,snare(a3,0x0c, 20),
        bass(g1),,,snare(a3,0x0c, 30),
    ];

    const moduledef = {
        songname: "trackerscripting",
        samples: samples,
        songpositions: [
            // patterns to play 
            0,
            1,
            2,
            5,
            3,
            4,
            6,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            6,
            6,
            7,
            8
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
            patternwithlead,
            patternwithpad,
            patternwithpadandsnare,
            toPatternArray(patternwithlead).insertNotes(
                synthbrasslead, 61, 2, [
                    e2,a2,b2
                ]            
            ).createSampleEcho(
                samples.findIndex(sample => sample.samplename === 'synthbrasslead') + 1,
                3, 18, 8, [0,1,2,3]
            ),
            createEmptyPatternArray().insertSampleNotes(
                0,3, [
                    kickandhihat(a3, 0, 0),
                    hihat(a3, 0xc, 0x10),
                    hihat(a3, 0xc, 0x30),
                    hihat(a3, 0xc, 0x10),
                    kickandsnare(a3),
                    hihat(a3, 0xc, 0x10),
                    hihat(a3, 0xc, 0x30),
                    hihat(a3, 0xc, 0x10),
                ].repeat(7)
            ).insertNotes(combinedlead, 0, 2, [
                a2,a2,g2,,a2,a2,g2,a2,,
                e2,,d2,,c2,e2,,,,,,,
                ,,,,,,,,,,,
                a2,a2,g2,,a2,,g2,a2,,,
                e2,,a2,,b2,c3,,,b2,,a2,,
                g2,d2
            ]).insertNotes(bass, 0, 0, [
                a1,,,a2,,a2,a1,g1,
                f1,,,f2,,f2,f1,cmd(0xa,0xc),
                c2,,,c3,,c3,c3,c1,
                b1,,b2,,b1,,b2,cmd(0xa,0xc)
            ].repeat(1)).insertSampleNotes(0, 1, [
                minorchord(a2,0xa,0x8),minorchord(a2,0xa,0x8),,minorchord(a2,0xa,0x8),
                ,,minorchord(a2),cmd(0xa,0x8),
                majorchord2(a2,0xa,0x8),majorchord2(a2,0xa,0x8),,majorchord2(a2,0xa,0x8),
                ,majorchord2(a2),,cmd(0xa,0x8),
                majorchord(c3,0xa,0x8),majorchord(c3,0xa,0x8),,majorchord(c3,0xa,0x8),
                ,,majorchord(c3),cmd(0xa,0x8),
                majorchord2(b2),,cmd(0xa,0xa),majorchord2(b2),
                ,cmd(0xa,0xa),majorchord2(b2),cmd(0xa,0xa)
            ].repeat(1))
            .createSampleEcho(combinedlead(), 3, 30, 8, [0, 2]),
            // pattern 7
            createEmptyPatternArray().insertSampleNotes(
                0,3, [
                    kickandhihat(a3, 0, 0),
                    hihat(a3, 0xc, 0x10),
                    hihat(a3, 0xc, 0x30),
                    hihat(a3, 0xc, 0x10),
                    kickandsnare(a3),
                    hihat(a3, 0xc, 0x10),
                    hihat(a3, 0xc, 0x30),
                    hihat(a3, 0xc, 0x10),
                ].repeat(7)
            ).insertNotes(combinedlead, 0, 2, [
                f2,f2,e2,,f2, ,g2,a2,,
                g2,,f2,,,,,
                a2,a2,g2,,
                a2,,b2,c3,
                ,c3,b2,,
                a2,,g2,a2
            ]).insertSampleNotes(0, 1,
                [minorchord2(f2,0xc,20)].concat([cmd(0xe,0xa1)].repeat(14)).
                concat([majorchord(f2,0xc,20)].concat([cmd(0xe,0xa1)].repeat(14))).
                concat(
                    [
                        majorchord2(e2,0xc,20)]
                            .concat([cmd(0xe,0xa1)].repeat(14))
                            .concat([cmd(0xe,0xb1)].repeat(15))
                    )
            ).insertNotes(bass, 0, 0, [
                d1,,cmd(0xa,0xc),d2(0xa,0xc),
                ,d2(0xa,0xc),d1,,
                d1,,d2,,
                e1,,e2,,
                f1,,cmd(0xa,0xc),f2(0xa,0xc),
                ,f2(0xa,0xc),f1,,
                f1,,f2,,
                g1,,g2,,
                a1,,cmd(0xa,0xc),a2(0xa,0xc),
                ,e2,g2(0xa,0xc),a2,
                e1,,e2,,
                g1,,g2,,
                a1,,cmd(0xa,0xc),a2(0xa,0xc),
                ,e2,g2(0xa,0xc),a2,
                e1,,e2,,
                g1,,g2,,
            ])
        ].transform(arr => {
            // Pattern 8
            const previouspatternindex = arr.length-1;
            arr = arr.concat([
                arr[previouspatternindex] // Change second half of previous pattern
                    .insertSampleNotes(32, 1, [
                        majorchord(g2,0xc,20)
                    ])
                    .insertNotes(bass, 32, 0, [
                        g1,,cmd(0xa,0xc),g2(0xa,0xc),
                        ,d2,e2(0xa,0xc),g2,
                        d1,,d2,,
                        e1,,e2,,
                    ].repeat(1))
                    .insertNotes(combinedlead, 31, 2, [
                        b2,
                        ,,,,
                        ,,,,
                        ,,,,
                        ,,,,
                        g3(0xc,10),d3(0xc,20),b2,d3(0xc,15),
                        b2(0xc,25),g2(0xc,20),b2(0xc,30),g2(0xc,25),
                        d2(0xc,35),g2,d2(0xc,30),b1,
                        d2,b1(0xc,30),g2,b1

                    ])
                    .insertSampleNotes(56,3,[
                        kickandhihat(a3),
                        snare(a3,0x0c,0x20),
                        hihat(a3,0x0c, 0x30),
                        snare(a3,0x0c,0x10),
                        kickandsnare(a3),
                        hihat(a3, 0x0c, 0x10),
                        snare(a3, 0x0c, 0x10),
                        snare(a3, 0x0c, 0x20),
                    ])
                    .createSampleEcho(combinedlead(), 3, 30, 8, [0, 2])
            ]);
            arr[previouspatternindex] = arr[previouspatternindex].createSampleEcho(combinedlead(), 3, 30, 8, [0, 2]);
            return arr;
        }).transform(arr => {
            // Pattern 12
            arr.push(toPatternArray(arr[0]).insertSampleNotes(0, 1, [
                minorchord(a2,0xc,20),,cmd(0xa,0xc),minorchord(a2,0xc,20),
                cmd(0xa,0xc),,,,
                majorchord2(a2,0xc,20),,cmd(0xa,0xc),majorchord2(a2,0xc,20),
                cmd(0xa,0xc),,majorchord(c3,0xc,20),,
                cmd(0xa,0xc),,,,
                ,,,,
                majorchord2(b2,0xc,20),,cmd(0xa,0xc),majorchord2(b2,0xc,20),
                ,cmd(0xa,0xc),majorchord2(a2,0xc,20),,
            ].repeat(1)))
            arr.push(arr[arr.length-1].map((v, n) => {
                if(n % (4 * 8) === 19) {
                    v = kickandsnare(a3)
                }
                return v;
            }));
            arr.push(toPatternArray(arr[arr.length-1]).insertNotes(combinedlead, 0, 2, [
                e2(0xa,0xc),a2(0xa,0xc),,e2,
                a2,e2(0xa,0x6),a2(0xa,0xc),e2,
                c3,b2(0xa,0xc),,g2,
                ,e2,,d2(0xa,0xc),
                ,,,,
                c2,d2,,e2(0xa,0xc),
                ,e2,g2(0xa,0xc),,
                e2(0xa,8),,,,
            ].repeat(1))        
            .createSampleEcho(combinedlead(), 3, 18, 6, [0,1,2,3]));
            arr.push(toPatternArray(arr[arr.length-2]).insertNotes(combinedlead, 0, 2, [
                e2(0xa,0xc),a2(0xa,0xc),,e2,
                a2,e2(0xa,0x6),a2(0xa,0xc),e2,
                c3,b2(0xa,0xc),,g2,
                ,e2,,d2(0xa,0xc),
                ,,,,
                c2,d2,,e2(0xa,0xc),
                ,e2,g2(0xa,0xc),,
                e2(0xa,8),,,,
            ].repeat(1))
            .insertSampleNotes(0, 3, [
                kickandhihat(a3),
                hihat(a3, 0x0c, 0x10),
                hihat(a3, 0x0c, 0x30),
                hihat(a3, 0x0c, 0x10),
                kickandsnare(a3),
                hihat(a3, 0x0c, 0x10),
                hihat(a3, 0x0c, 0x30),
                hihat(a3, 0x0c, 0x10)
            ].repeat(6))
            .insertSampleNotes(56, 3, [
                kickandhihat(a3),
                snare(a3, 0x0c, 0x20),
                hihat(a3, 0x0c, 0x30),
                snare(a3, 0x0c, 0x10),
                kickandsnare(a3),
                hihat(a3, 0x0c, 0x10),
                snare(a3, 0x0c, 0x10),
                snare(a3, 0x0c, 0x20),
            ])
            .insertNotes(combinedlead,48,2,[
                clr,g2(0xa,0x8),b2(0xc,0x10),cmd(0xa,0x8),
                c3(0xc,0x10),b2(0xc,0x20),g2(0xa,0x8),d2(0xc,0x8),
                c2,d2(0xa,0xc),e2,g2,a2(0xa,0x8),c3,d3,e3
            ])
            .createSampleEcho(combinedlead(), 3, 18, 6, [0,1,2,3])
            );
            return arr;
        })
    };

    createSampleEcho(moduledef.patterns[2],
        synthbrasslead(),
        3, 18, 8, [0,1,2,3]);

    postMessage(writeMod(moduledef));
	
}