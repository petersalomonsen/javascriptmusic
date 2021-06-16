const midimixerhtml = `
<style>
  :host {
    display: inline-block;
    overflow-x: scroll;
    max-height: 220px;
  }
  .panslider {
    width: 50px;
  }
  .volumeslider {
     appearance: slider-vertical;
     -webkit-appearance: slider-vertical;
  }
  .mixerchannel {
    display: flex;
    text-align: center;
    flex-direction: column;
    width: 60px;
    font-size: 11px;
  }
</style>
<template id="mixerchanneltemplate">
  <div class="mixerchannel">
    <input class="panslider" 
           type="range" min=0 max=127 value=64>
    <span class="panvaluespan">&nbsp;</span>
    <input class="volumeslider" type="range" min=0 max=127 value=100 orient="vertical">
    <span class="volumevaluespan">&nbsp;</span>
    <span class="channelnamespan">&nbsp;</span>
  </div>
</template>
<div style="display: flex" id="mixerchannels">
</div>
`;

customElements.define('midi-mixer',
    class extends HTMLElement {
        constructor() {
            super();

            this.attachShadow({ mode: 'open' });

            this.shadowRoot.innerHTML = midimixerhtml;
            this.init();
        }

        init() {
            const mixerchanneltemplate = this.shadowRoot.querySelector('#mixerchanneltemplate');

            const channelnames = this.dataset.channels ? this.dataset.channels.split(',') : new Array(16).fill('').map((v, ndx) => `ch ${ndx}`);

            for (let n = 0; n < 16; n++) {
                const mixerchanneltemplateinstance = mixerchanneltemplate.content.cloneNode(true);

                this.shadowRoot.querySelector("#mixerchannels").appendChild(mixerchanneltemplateinstance);
                this.shadowRoot.querySelectorAll(".channelnamespan")[n].innerHTML = channelnames[n];

                const volumeslider = this.shadowRoot.querySelectorAll(".volumeslider")[n];
                volumeslider.addEventListener("input", (evt) => {
                    evt.stopPropagation();
                    this.shadowRoot.querySelectorAll(".volumevaluespan")[n].innerHTML = volumeslider.value;
                    this.oninput(new CustomEvent('midimixerevent', {
                        detail: {
                            channel: n,
                            controller: 7,
                            value: parseInt(volumeslider.value)
                        }
                    }));
                });

                const panslider = this.shadowRoot.querySelectorAll(".panslider")[n];
                panslider.addEventListener("input", (evt) => {
                    evt.stopPropagation();
                    this.shadowRoot.querySelectorAll(".panvaluespan")[n].innerHTML = panslider.value;
                    this.oninput(new CustomEvent('midimixerevent', {
                        detail: {
                            channel: n,
                            controller: 10,
                            value: parseInt(panslider.value)
                        }
                    }));
                });

                if (!channelnames[n]) {                   
                    this.shadowRoot.querySelectorAll(".mixerchannel")[n].style.display = 'none';
                }
            }
        }

        setVolume(channel, value) {          
          const volumeSliderElement = this.shadowRoot.querySelectorAll(".volumeslider")[channel];
          volumeSliderElement.value = value;          
          volumeSliderElement.dispatchEvent(new InputEvent('input'));
        }

        setPan(channel, value) {          
          const panSliderElement = this.shadowRoot.querySelectorAll(".panslider")[channel];
          panSliderElement.value = value;          
          panSliderElement.dispatchEvent(new InputEvent('input'));
        }

        getState() {
          const panvalues = new Array(16);
          const volumevalues = new Array(16);
          this.shadowRoot.querySelectorAll(".panslider").forEach((elm, ndx) => panvalues[ndx] = elm.value);
          this.shadowRoot.querySelectorAll(".volumeslider").forEach((elm, ndx) => volumevalues[ndx] = elm.value);
          return new Array(16).fill(null).map((v, n) => ({pan: panvalues[n], volume: volumevalues[n]}));
        }
    });
