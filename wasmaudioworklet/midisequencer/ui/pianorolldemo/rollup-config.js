import html from '@web/rollup-plugin-html';
import { terser } from 'rollup-plugin-terser';
import { readFileSync} from 'fs';

export default {
  input: './index.html',
  output: { dir: 'dist' },
  plugins: [html({
    minify: true,
    extractAssets: false,
    transformHtml: [html =>
      html.replace('<link rel="stylesheet" href="styles.css">', `<style>${readFileSync('./styles.css').toString()}</style>`)
    ]
  }), terser()],
};