import { chromeLauncher } from '@web/test-runner';

export default {
    concurrency: 1,
    watch: true,
    testRunnerHtml: testRunnerImport =>
    `<html>
      <body>
        <script type="module">
            import { expect, assert} from 'https://cdn.jsdelivr.net/npm/chai@5.0.0/+esm';
            globalThis.assert = assert;
            globalThis.expect = expect;
        </script>        
        <script type="module" src="${testRunnerImport}"></script>
      </body>
    </html>`,  
    browsers: [chromeLauncher({ launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } })],
};