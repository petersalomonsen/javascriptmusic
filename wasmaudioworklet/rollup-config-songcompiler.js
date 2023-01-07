import terser from '@rollup/plugin-terser';

export default {
    input: './midisequencer/embeddablesongcompiler.js',
    output: { file: '../dist/songcompiler.bundle.js', format: 'esm'},
    plugins: [terser()],
};