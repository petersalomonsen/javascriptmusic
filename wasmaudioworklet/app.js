import {} from './audioworkletpolyfill.js';
import { initAudioWorkletNode } from './audioworkletnode.js';
import { initVisualizer } from './visualizer/80sgrid.js';
import { initEditor } from './editorcontroller.js';

let componentRoot;

customElements.define('app-javascriptmusic',
  class extends HTMLElement {
    constructor() {
      super();
      
      componentRoot = this.attachShadow({mode: 'open'});
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

export function setInstrumentNames(instrumentNames) {
  const instrSelect = componentRoot.getElementById('midichannelmappingselection');
  const selectedIndex = instrSelect.selectedIndex;
  let instrSelectCount = 0;
  instrumentNames.forEach((name, ndx) => {            
      const opt = document.createElement('option');
      opt.value = name;
      opt.innerText = name;            
      window.midichannelmappings[name] = ndx;
      if(instrSelect.childNodes.length <= ndx) {
          instrSelect.appendChild(opt);
      } else if(instrSelect.childNodes[ndx].value !== name) {
          instrSelect.replaceChild(opt, instrSelect.childNodes[ndx]);
      }
      instrSelectCount++;
  });
  if (selectedIndex > -1 && selectedIndex < instrumentNames.length) {
    instrSelect.selectedIndex = selectedIndex;
  }
  return instrSelectCount;
}