import { terser } from 'rollup-plugin-terser';

export default {
  input: 'pianorolldemo.js',
  output: {
    file: 'pianorolldemo.bundle.js',
    format: 'es',
    compact: 'true'
  },
  plugins: [terser()]
};