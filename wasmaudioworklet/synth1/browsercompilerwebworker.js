importScripts('https://cdn.jsdelivr.net/gh/AssemblyScript/binaryen.js@89.0.0-nightly.20191113/index.js');
importScripts('https://cdn.jsdelivr.net/gh/AssemblyScript/AssemblyScript@0.8.1/dist/assemblyscript.js');
importScripts('https://cdn.jsdelivr.net/gh/AssemblyScript/AssemblyScript@0.8.1/dist/asc.js');

let assemblyscriptsynthsources;

fetch('wasmsynthassemblyscriptsources.json').then(r => r.json())
    .then(obj => {
        assemblyscriptsynthsources = obj;
        assemblyscriptsynthsources['mixes/newyear.mix.ts'] = null; // force compile first time
});

function compileAssemblyScript(sources, options, entrypoint) {
    if (typeof sources === "string") sources = { "input.ts": sources };
    const output = Object.create({
        stdout: asc.createMemoryStream(),
        stderr: asc.createMemoryStream()
    });
    var argv = [
        "--binaryFile", "binary",
        "--textFile", "text",
    ];
    Object.keys(options || {}).forEach(key => {
        var val = options[key];
        if (Array.isArray(val)) val.forEach(val => argv.push("--" + key, String(val)));
        else argv.push("--" + key, String(val));
    });
    asc.main(entrypoint ? argv.concat(entrypoint) : argv.concat(Object.keys(sources)), {
        stdout: output.stdout,
        stderr: output.stderr,
        readFile: name => sources.hasOwnProperty(name) ? sources[name] : null,
        writeFile: (name, contents) => output[name] = contents,
        listFiles: () => []
    });
    
    return output;
}

onmessage = function (msg) {
    const synthsource = msg.data;

    if(assemblyscriptsynthsources['mixes/newyear.mix.ts'] !== synthsource) {
        assemblyscriptsynthsources['mixes/newyear.mix.ts'] = synthsource;
        const {stderr, text, binary} = compileAssemblyScript(assemblyscriptsynthsources,
                { "runtime": "none", "optimizeLevel": 0, "shrinkLevel": 0},
                'index.ts');
        const errors = stderr.toString();
        if(errors) {
            postMessage({
                error: errors
            });
        } else {
            this.postMessage({
                binary: binary
            });            
        }
    } else {
        postMessage({
            nochanges: true
        });
    }
}