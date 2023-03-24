import { loadScript } from "../common/scriptloader.js";

let scriptspromise;
let jsYamlPromise;

export function isSointuSong(song) {
    return song.instruments.findIndex(instr => instr.sointu) > -1;
}

export async function getSointuWasm(song) {
    if (!scriptspromise) {
        globalThis.exports = {};
        scriptspromise = loadScript('https://cdn.jsdelivr.net/npm/wabt@1.0.32/index.js');
        jsYamlPromise = import('https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.mjs');
    }
    await scriptspromise;
    const jsYaml = await jsYamlPromise;

    const yaml = jsYaml.dump({
        bpm: song.BPM,
        rowsperbeat: 4,
        createemptypatterns: true,
        score: {
            length: song.instrumentPatternLists[0].length,
            rowsperpattern: song.patternsize,
            tracks: song.instrumentPatternLists.slice(0, 7).map(track => {
                const patternMap = {};
                track.forEach(patternIndex => {
                    patternMap[`${patternIndex}`] = song.patterns[patternIndex-1];
                });
                const patternIndices = Object.keys(patternMap);
                const patterns = patternIndices.map(patternIndex => patternMap[`${patternIndex}`]);
                const order = track.map((patternIndex) => {
                    return patternIndices.indexOf(`${patternIndex}`);
                });
                return {
                    numvoices: 1,
                    order,
                    patterns
                }
            })
        },
        patch: song.instruments.map(instr => instr.sointu)
    });

    const wat = await fetch('http://localhost:10000/process', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ content: yaml })
    }).then(r => r.text());

    const wabt = await exports.WabtModule();
    const wasm = wabt.parseWat('song.wat', wat);
    const wasmbin = wasm.toBinary({}).buffer;

    return wasmbin;
}