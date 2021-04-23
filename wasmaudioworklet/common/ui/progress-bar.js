const progressbarhtml = `
<style type="text/css">
:host {
    position: fixed;
    top:0;
	bottom: 0;
	left: 0;
	right: 0;
    font-family: monospace;
    margin: auto;
    z-index: 1000;
    background-color: rgba(255, 255, 255, 0.7);
}

.progress-border {
    position: fixed;
    top:0;
	bottom: 0;
	left: 0;
	right: 0;
  	
    margin: auto;

    border: green solid 1px;
    height: 50px;
    width: 100%;
}

.progress-text {
    position: absolute;
    color: white;
    text-align: center;
    width: 100%;
    height: 100%;
    font-size: 45px;
}

.progress-fill {
    background-color: rgba(0,255,0, 0.7);
    height: 50px;    
}
</style>
<div id="main-progress-bar" class="progress-border">
<div class="progress-text">50%</div>
<div class="progress-fill" style="width:20%"></div>
</div>
`;

let progressbar;

customElements.define('progress-bar', class ProgressBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = progressbarhtml;
    }

    setValue(val) {
        this.shadowRoot.querySelector('.progress-text').innerHTML = `${(val * 100).toFixed(0)}%`;
        this.shadowRoot.querySelector('.progress-fill').style.width = `${(val * 100).toFixed(2)}%`;
    }
});

export function setProgressbarValue(val) {
    if (val !== null) {
        if (!progressbar) {
            progressbar = document.createElement('progress-bar');
            document.documentElement.appendChild(progressbar);
        }
        progressbar.setValue(val);
    } else if (progressbar) {
        progressbar.remove();
        progressbar = null;
    }
}
