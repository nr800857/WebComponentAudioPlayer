class visualiser extends HTMLElement{
    constructor() {
        super();
        this.attachShadow({mode:'open'});
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
            #myCanvas {
                border: 1px solid black;
                width: 100%;
            }
            #visualiser {
                width: 80%;
                display: block;
                margin: auto;
            }
            </style>
            <div id="visualiser">
                <canvas id="myCanvas" width=100 height=100></canvas>

            </div>
        `;

        this.canvas = this.shadowRoot.querySelector('#myCanvas');
  
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.canvasContext = this.canvas.getContext('2d');    

        this.initAudio();
    }

    initAudio(){
        setTimeout(() => {
            if(this.audioContext != null){   
                requestAnimationFrame(() => this.visualize());
        }
        });
    }
      
      visualize() {
        // clear the canvas
        // like this: canvasContext.clearRect(0, 0, width, height);
        
        // Or use rgba fill to give a slight blur effect
        this.canvasContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.canvasContext.fillRect(0, 0, this.width, this.height);
        
        // Get the analyser data
        this.analyser.getByteTimeDomainData(this.dataArray);
      
        this.canvasContext.lineWidth = 2;
        this.canvasContext.strokeStyle = 'lightBlue';
      
        // all the waveform is in one single path, first let's
        // clear any previous path that could be in the buffer
        this.canvasContext.beginPath();
        
        var sliceWidth = this.width / this.bufferLength;
        var x = 0;
      
        for(var i = 0; i < this.bufferLength; i++) {
           var v = this.dataArray[i] / 255;
           var y = v * this.height;
      
           if(i === 0) {
              this.canvasContext.moveTo(x, y);
           } else {
              this.canvasContext.lineTo(x, y);
           }
      
           x += sliceWidth;
        }
      
        this.canvasContext.lineTo(this.width, this.height/2);
        
        // draw the path at once
        this.canvasContext.stroke();  
        
        // call again the visualize function at 60 frames/s
        requestAnimationFrame(() => this.visualize());
    }
}

customElements.define("my-visualiser", visualiser);