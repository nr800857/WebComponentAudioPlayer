class egaliseur extends HTMLElement{
    constructor() {
        super();
        this.attachShadow({mode:'open'});
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
            </style>
            <div id="egaliseur" class="hidden">
                <div class="controls">
                    <label>60Hz</label>
                    <input type="range" value="0" step="1" min="-30" max="30" id="eq1"></input>
                    <output id="gain0">0 dB</output>
                </div>
                <div class="controls">
                    <label>170Hz</label>
                    <input type="range" value="0" step="1" min="-30" max="30" id="eq2"></input>
                <output id="gain1">0 dB</output>
                </div>
                <div class="controls">
                    <label>350Hz</label>
                    <input type="range" value="0" step="1" min="-30" max="30" id="eq3"></input>
                <output id="gain2">0 dB</output>
                </div>
                <div class="controls">
                    <label>1000Hz</label>
                    <input type="range" value="0" step="1" min="-30" max="30" id="eq4"></input>
                <output id="gain3">0 dB</output>
                </div>
                <div class="controls">
                    <label>3500Hz</label>
                    <input type="range" value="0" step="1" min="-30" max="30" id="eq5"></input>
                <output id="gain4">0 dB</output>
                </div>
                <div class="controls">
                    <label>10000Hz</label>
                    <input type="range" value="0" step="1" min="-30" max="30" id="eq6"></input>
                <output id="gain5">0 dB</output>
                </div>
                <div class="controls">
                <label>Balance</label>
                    <input type="range" value="0" step="0.1" min="-1" max="1" id="balance"></input>
                    <output id="balanceOutput">0</output>
              </div>
            </div>
        `;

        this.egaliseur = this.shadowRoot.querySelector("#egaliseur");
        this.filters = [];
        this.dataArray;
        this.bufferLength;
        this.initEgaliseur();

    }

    initEgaliseur(){
        setTimeout(() => {
            if(this.filters != null) {
                this.defineListenerEgalizer();
            }
        });
    }

    defineListenerEgalizer() {
        this.shadowRoot.querySelector("#eq1").addEventListener('input', (evt) => {
            this.changeGain(evt.target.value, 0);
        });
        this.shadowRoot.querySelector("#eq2").addEventListener('input', (evt) => {
            this.changeGain(evt.target.value, 1);
        });
        this.shadowRoot.querySelector("#eq3").addEventListener('input', (evt) => {
            this.changeGain(evt.target.value, 2);
        });
        this.shadowRoot.querySelector("#eq4").addEventListener('input', (evt) => {
            this.changeGain(evt.target.value, 3);
        });
        this.shadowRoot.querySelector("#eq5").addEventListener('input', (evt) => {
            this.changeGain(evt.target.value, 4);
        });
        this.shadowRoot.querySelector("#eq6").addEventListener('input', (evt) => {
            this.changeGain(evt.target.value, 5);
        });
        this.shadowRoot.querySelector("#balance").addEventListener('input', (evt) => {
            this.changeBalance(evt.target.value);
        });

    }

    changeGain(sliderVal,nbFilter) {
        var value = parseFloat(sliderVal);
        this.filters[nbFilter].gain.value = value;
        
        // update output labels
        var output = this.shadowRoot.querySelector("#gain"+nbFilter);
        output.value = value + " dB";
    }

    changeBalance(sliderVal) {
        // between -1 and +1
        var value = parseFloat(sliderVal);
        this.stereoPanner.pan.value = value;
         // update output labels
        var output = this.shadowRoot.querySelector("#balanceOutput");
        output.value = value;
      }
}

customElements.define("my-egaliseur", egaliseur);