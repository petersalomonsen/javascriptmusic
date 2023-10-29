importScripts('https://cdn.jsdelivr.net/npm/es-module-shims@1/dist/es-module-shims.wasm.min.js');


const importMap = {
    imports: {
        "assemblyscript": "https://cdn.jsdelivr.net/npm/assemblyscript@0.27.14/dist/assemblyscript.js",
        "assemblyscript/asc": "https://cdn.jsdelivr.net/npm/assemblyscript@0.27.14/dist/asc.js",
        "binaryen": "https://cdn.jsdelivr.net/npm/binaryen@112.0.0-nightly.20230411/index.js",
        "long": "https://cdn.jsdelivr.net/npm/long@5.2.1/index.js"
    }
};


importShim.addImportMap(importMap);
importShim('./browsercompilerwebworker.js').then((res) => {
    console.log("module has been loaded");
})
    .catch(e => setTimeout(() => { throw e; }));