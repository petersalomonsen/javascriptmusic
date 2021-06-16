import { waitForAppReady } from './app.js';

describe('app', function() {
    this.timeout(10000);
    this.afterAll(async () => {
        document.documentElement.removeChild(document.querySelector('app-javascriptmusic'));
    });
    it('should start app, and show spinner while starting', async () => {
        document.documentElement.appendChild(document.createElement('app-javascriptmusic'));
        while (document.getElementsByTagName('progress-spinner').length === 0) {
            await new Promise(r => setTimeout(() => r(), 0));
        }
        assert.equal(document.getElementsByTagName('progress-spinner').length, 1);
        await waitForAppReady();
        const appElement = document.getElementsByTagName('app-javascriptmusic')[0].shadowRoot;        
        assert.equal(appElement.querySelector('#startaudiobutton').disabled, false);
        assert.equal(document.getElementsByTagName('progress-spinner').length, 0);
    });
    
});