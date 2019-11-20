import { writeMod, cmd } from './protrackermodwriter.js';
import { createSamples } from './instrumentgenerator.js';

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
            samplename: "sinelead",
            funcname: "sinelead",
            finetune: 0,
            volume: 25,
            loopstart: 0,
            looplength: 0
        };        
    }
]);

const moduledef = {
    songname: "hello song",
    samples: samples,
    songpositions: [
        // patterns to play        
        0,
        1,
        2,
        2
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
            bass(a1, 0x0a, 0x0c),sinelead(ds3, 1, 2),lead(c2, 0, 0),kick(a3, 0, 0),
            ,cmd(4,0x51),,,
            bass(a1, 0x0a, 0x0c),cmd(4,0x51),,,
            bass(a2, 0x0a, 0x0c),cmd(4,0x51),,,
            snare(a3),,sinelead(d3),kick(a3, 0, 0),
            bass(a2, 0x0a, 0x0c),,,,
            bass(a1, 0x0a, 0x0c),,,,
            bass(g1, 0x0a, 0x0c),,sinelead(c3),,
            bass(f1),,,kick(a3, 0, 0),
            ,,sinelead(a2),,
            ,,,lead(e2, 0, 0),
            bass(f2, 0x0a, 0x0c),sinelead(a2),,,
            snare(a3),sinelead(b2),lead(a2, 0, 0),kick(a3, 0, 0),
            bass(f2, 0x0a, 0x0c),,,,
            bass(f1, 0x0a, 0x0c),,sinelead(c3),lead(c3, 0, 0),
            ,,,,
            bass(g1),sinelead(d3, 0, 0),lead(b2, 0, 0),kick(a3, 0, 0),
            ,,,,
            ,,,lead(g2, 0, 0),
            bass(g2, 0x0a, 0x0c),,,,
            snare(a3),sinelead(c3, 0, 0),lead(d2, 0, 0),kick(a3, 0, 0),
            bass(g2, 0x0a, 0x0c),,,,
            bass(g1, 0x0a, 0x0c),,,lead(e2, 0, 0),
            ,,,kick(a3, 0x0c, 20),
            bass(e1),lead(b1, 0, 0),sinelead(b2, 0, 0),kick(a3, 0, 0),
            ,,,sinelead(c3, 0, 0),
            bass(e2, 0x0a, 0x0c),sinelead(b2, 0, 0),,lead(g2, 0, 0),
            bass(e1, 0x0c, 0x20),sinelead(a2, 0, 0),,,
            bass(g1),snare(a3),,kick(a3, 0, 0),
            ,,lead(a2, 0, 0),sinelead(g2, 0, 0),
            bass(g2),,,,
            bass(g1),sinelead(e2, 0, 0),snare(a3, 0x0c, 20),,

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
            bass(g1),sinelead(d2, 0, 0),lead(b2, 0, 0),kick(a3, 0, 0),
            ,,,sinelead(g2, 0, 0),
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
        ]
    ]
};

moduledef.patterns[2].forEach((val, ndx, arr) => {
    if(val[0] === 6 && val[2] !== 0x01) {           
        // echo effect
        const row = (ndx >> 2) + 3;     
        for(let ch = 0; ch < 4; ch++) {            
            if(!arr[row * 4 + ch]) {               
                const newVal = val[2] !== 0x0c ? 18 : val[3] - 8; 
                if(newVal > 0 ) {
                    arr[row * 4 + ch] = [val[0], val[1], 0x0c, newVal];                
                }
                break;
            }
        }
        
    }
});
writeMod('test.mod', moduledef);