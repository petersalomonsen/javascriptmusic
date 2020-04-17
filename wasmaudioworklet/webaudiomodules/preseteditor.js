import { wamsynth } from './wammanager.js';
import { synthsourceeditor } from '../editorcontroller.js';
import { getInstrumentNamesFromYoshimiXML } from './yoshimi-xml-parser.js';
import { setInstrumentNames } from '../app.js';

customElements.define('wam-preseteditor',
    class extends HTMLElement {
        constructor() {
            super();
            
            this.attachShadow({mode: 'open'});
            this.init();      
        }

        async init() {
            const apphtml = await fetch('webaudiomodules/preseteditor.html').then(r => r.text());
            this.shadowRoot.innerHTML = apphtml;

            const soundbanks = await fetch('https://unpkg.com/wasm-yoshimi@0.0.1/banks/root.json').then(r => r.json());
            
            const presetSelectTemplate = this.shadowRoot.getElementById('presetselecttemplate');
            const bankSelectElement = presetSelectTemplate.content.querySelector('#bankselect');
            
            soundbanks.forEach(soundbank => {
                const option = document.createElement('option');
                option.value = soundbank.name;
                option.innerHTML = soundbank.name;
                bankSelectElement.appendChild(option);
            });        

            const instrumentNames = getInstrumentNamesFromYoshimiXML(synthsourceeditor.doc.getValue());
            setInstrumentNames(instrumentNames);        
            
            for (let channel = 0; channel < 16; channel++) {
                const presetSelectTemplateClone = presetSelectTemplate.content.cloneNode(true);
                const instrumentSelectElement = presetSelectTemplateClone.querySelector('#instrumentselect');
                const currentinstrumentspan = presetSelectTemplateClone.querySelector('#currentinstrumentspan');
                instrumentSelectElement.addEventListener('change', async evt => {
                    const instrumentPath = evt.target.value;
                    const paramsxml = (await wamsynth.loadpreset(channel, instrumentPath)).paramsxml;
                    synthsourceeditor.doc.setValue(paramsxml);
                    localStorage.setItem('storedsynthcode', paramsxml);
                    
                    const instrumentName = instrumentPath.replace(/.xiz$/,'').substr(instrumentPath.indexOf('/') + 1);                    
                    currentinstrumentspan.innerHTML = instrumentName;
                    instrumentNames[channel] = instrumentName;
                    setInstrumentNames(instrumentNames);
                });
                const channelspan = presetSelectTemplateClone.querySelector('#channelspan');
                channelspan.innerHTML = `${channel}`;
                currentinstrumentspan.innerHTML = instrumentNames[channel];
                presetSelectTemplateClone.querySelector('#bankselect').addEventListener('change', (evt) => {   
                    const soundbank = soundbanks.find(soundbank => soundbank.name === evt.target.value);
                    instrumentSelectElement.innerHTML = '<option disabled selected value>select instrument...</option>';
                    soundbank.instruments.forEach(instrument => {
                        const instrOption = document.createElement('option');
                        instrOption.value = `${soundbank.name}/${instrument}`;
                        instrOption.innerHTML = instrument.replace(/.xiz$/,'');
                        instrumentSelectElement.appendChild(instrOption);
                    });
                });

                this.shadowRoot.querySelector('#instrumentrows').appendChild(presetSelectTemplateClone);
            }
            
        }
    }
);