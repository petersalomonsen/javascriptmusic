import {} from './audioworkletpolyfill.js';
import { initAudioWorkletNode } from './audioworkletnode.js';
import { initVisualizer } from './visualizer/80sgrid.js';
import { initEditor } from './editorcontroller.js';

customElements.define('app-javascriptmusic',
  class JavaScriptMusic extends HTMLElement {
    constructor() {
      super();
      
      this.shadowRoot = this.attachShadow({mode: 'open'});
      this.init();      
    }

    async init() {
        const apphtml = await fetch('app.html').then(r => r.text());
        this.shadowRoot.innerHTML = apphtml;
        initAudioWorkletNode(this.shadowRoot);
        initVisualizer(this.shadowRoot);
        initEditor(this.shadowRoot);
    }
  }
);