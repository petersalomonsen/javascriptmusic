importScripts('https://cdn.jsdelivr.net/npm/es-module-shims@1/dist/es-module-shims.wasm.min.js');


const importMap = {
    imports: {
        "assemblyscript": "https://cdn.jsdelivr.net/npm/assemblyscript@0.28.9/dist/assemblyscript.js",
        "assemblyscript/asc": "https://cdn.jsdelivr.net/npm/assemblyscript@0.28.9/dist/asc.js",
        "binaryen": "https://cdn.jsdelivr.net/npm/binaryen@123.0.0-nightly.20250530/index.js",
        "long": "https://cdn.jsdelivr.net/npm/long@5.2.4/index.js"
    }
};


importShim.addImportMap(importMap);
importShim('./browsercompilerwebworker.js').then((res) => {
    console.log("module has been loaded");
    postMessage('ready');
}).catch(e => setTimeout(() => { throw e; }));