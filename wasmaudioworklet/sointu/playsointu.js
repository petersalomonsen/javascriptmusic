import { loadScript } from "../common/scriptloader.js";

let scriptspromise;

export async function getSointuWasm() {
    if (!scriptspromise) {
        globalThis.exports = {};
        scriptspromise = loadScript('https://cdn.jsdelivr.net/npm/wabt@1.0.32/index.js');
    }
    await scriptspromise;

    const wabt = await exports.WabtModule();

    const wat = await fetch(new URL('groove.wat', import.meta.url)).then(r => r.text());

    const wasm = wabt.parseWat('groove.wat', wat);
    const wasmbin = wasm.toBinary({}).buffer;

    return wasmbin;


}