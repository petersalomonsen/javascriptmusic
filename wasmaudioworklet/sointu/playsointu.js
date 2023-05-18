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

    let unitId = 1;

    song.instruments.forEach((instr, ndx) => {
        const unitIdMap = {};

        instr.sointu = JSON.parse(JSON.stringify(instr.sointu));
        instr.sointu.units.forEach(unit => {
            if (unit.id) {
                unitIdMap[unit.id] = unitId;
            }
            unit.id = unitId++;
        });
        instr.sointu.units.forEach(unit => {
            if (unit.parameters?.target) {
                unit.parameters.target = unitIdMap[unit.parameters.target];
            }
        });
    });

    const sointusong = {
        bpm: song.BPM,
        rowsperbeat: song.rowsperbeat,
        createemptypatterns: true,
        wasmdisablerenderonstart: true,
        score: {
            length: song.instrumentPatternLists[0].length,
            rowsperpattern: song.patternsize,
            tracks: song.instrumentPatternLists.map(track => {
                const patternMap = {};
                track.forEach(patternIndex => {
                    if (patternIndex > 0) {
                        patternMap[`${patternIndex}`] = song.patterns[patternIndex - 1];
                    } else {
                        patternMap[`${patternIndex}`] = new Array(song.patternsize).fill(0);
                    }
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
    };

    const wat = await fetch('http://35.222.223.189:10000/process', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ content: jsYaml.dump(sointusong) })
    }).then(r => r.text());

    const wabt = await exports.WabtModule();
    const wasm = wabt.parseWat('song.wat', wat);
    const wasmbin = wasm.toBinary({}).buffer;

    return wasmbin;
}