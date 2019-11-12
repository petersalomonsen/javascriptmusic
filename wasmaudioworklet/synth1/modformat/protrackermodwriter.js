import { writeFileSync } from 'fs';

/**
 * Convenience functions for creating notes
 */
export const periodToSampleRatePAL = (period) => Math.round(7093789.2 / (period * 2));

const periods =  [  856,808,762,720,678,640,604,570,538,508,480,453,
    428,404,381,360,339,320,302,285,269,254,240,226,
    214,202,190,180,170,160,151,143,135,127,120,113];
periods.forEach((period, ndx) => 
    global[['c','cs','d','ds','e','f','fs','g','gs','a','as','b'][ndx%12] + (Math.floor(ndx / 12) + 1)] = period
);

function str2char(str) {
    const ret = new Uint8Array(str.length);
    for(let n=0; n<str.length; n++) {
        ret[n] = str.charCodeAt(n);
    }
    return ret;
}

function num2word(num) {
    return [ num >> 8, num & 0xff];
}

export function writeMod(modFileName, moduledef) {
    // http://coppershade.org/articles/More!/Topics/Protracker_File_Format/

    const patternsOffset = 1084;
    const numPatterns = moduledef.patterns.length;
    const output = new Uint8Array(patternsOffset + (numPatterns * 1024) +
            moduledef.samples.reduce((p,sample) => p + sample.data.length,0));
    output.set(str2char(moduledef.songname), 0);

    let sampleDataOffset = patternsOffset + (numPatterns * 1024);
    moduledef.samples.forEach((sample, ndx) => {
        const offset = ndx * 30 + 20;
        
        output.set(str2char(sample.samplename), offset);
        output.set(num2word(sample.data.length >> 1), offset + 22);
        output.set([sample.finetune], offset + 24);
        output.set([sample.volume], offset + 25);
        output.set(num2word(sample.loopstart >> 1), offset + 26);
        output.set(num2word(sample.looplength >> 1), offset + 28);
        output.set(sample.data, sampleDataOffset);
        sampleDataOffset += sample.data.length;
    });
    
    // song length
    output.set([moduledef.songpositions.length], 950);

    /*
    Well... this little byte here is set to 127, so that old
    trackers will search through all patterns when loading.
    Noisetracker uses this byte for restart, but we don't.
    */
    output.set([127], 951);

    moduledef.songpositions.forEach((val, ndx) => output.set([val], 952 + ndx));
    output.set(str2char('M.K.'), 1080);

    moduledef.patterns.forEach((pattern, patternNdx) => {
        pattern.forEach((note, noteNdx) => {
            const offset = patternsOffset + (patternNdx * 1024) + (noteNdx * 4);
            output.set([
                note[0] & 0xf0 | (note[1] >> 8 & 0x0f),
                note[1], // period
                note[0] << 4 | (note[2] & 0x0f), // instr, effect no
                note[3] // effect value
            ], offset);
        });
    });


    writeFileSync(modFileName, output, {encoding: 'binary'});
}