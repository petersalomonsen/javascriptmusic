const midimixerhtml = `
<style>
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
    border: #ccc solid 1px;
    width: 60px;
  }
</style>
<template id="mixerchanneltemplate">
  <div class="mixerchannel">
    <input class="panslider" 
           type="range" min=0 max=127 value=64>
    <span class="panvaluespan">&nbsp;</span>
    <input class="volumeslider" type="range" min=0 max=127 value=100>
    <span class="volumevaluespan">&nbsp;</span>
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

            for (let n = 0; n < 16; n++) {
                const mixerchanneltemplateinstance = mixerchanneltemplate.content.cloneNode(true);

                this.shadowRoot.querySelector("#mixerchannels").appendChild(mixerchanneltemplateinstance);

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
            }
        }
    });
