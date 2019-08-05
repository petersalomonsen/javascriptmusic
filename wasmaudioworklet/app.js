import {} from './audioworkletpolyfill.js';
import { initAudioWorkletNode } from './audioworkletnode.js';
import { initVisualizer } from './visualizer/80sgrid.js';

// import {} from 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.2/codemirror.min.js';
// import {} from 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.2/mode/javascript/javascript.js';
  
import { initEditor } from './editorcontroller.js';

customElements.define('app-javascriptmusic',
  class extends HTMLElement {
    constructor() {
      super();
      
      const shadowRoot = this.attachShadow({mode: 'open'});
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