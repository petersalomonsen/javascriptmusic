import { terser } from 'rollup-plugin-terser';
import { readFileSync, unlinkSync, writeFileSync, existsSync } from 'fs';

export default [
{
    input: 'renderworker.js',
    output: { file: 'renderworker.bundle.js', format: 'esm'},
    plugins: [
        terser()
    ]
},    
{
    input: 'main.js',
    output: { file: 'main.bundle.js', format: 'esm' },
    plugins: [
        (() => ({
            transform(code, id) {
                const urlMatches = code.match(/(new URL\([^),]+\,\s*import.meta.url\s*\))/g);

                if (urlMatches) {
                    for (let urlMatch of urlMatches) {
                        const urlWithAbsolutePath = urlMatch.replace('import.meta.url', `'file://${id}'`);

                        const func = new Function('return ' + urlWithAbsolutePath);
                        const resolvedUrl = func();
                        const pathname = resolvedUrl.pathname.replace(/.js$/,'.bundle.js');

                        if (pathname.endsWith('.js') && existsSync(pathname)) {
                            const jsfilecontent = readFileSync(pathname).toString();

                            code = code.replace(urlMatch, '"data:application/javascript,' + encodeURIComponent(jsfilecontent)+'"');
                        }
                    }
                }
                return { code };
            }
        }))(),
        terser(),
        {
            name: 'inline-js',
            closeBundle: () => {
                const js = readFileSync('main.bundle.js').toString();
                const html = readFileSync('index.html').toString()
                    .replace(`<script type="module" src="main.js"></script>`,
                        `<script type="module">${js}</script>`);

                writeFileSync(`index.bundle.html`, html);
                unlinkSync('main.bundle.js');
                unlinkSync('renderworker.bundle.js');
            }
        }
    ]
}];
