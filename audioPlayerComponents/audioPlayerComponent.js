import './lib/webaudio-controls.js'
import './visualiser.js'
import './egaliseur.js'

const AudioContext = window.AudioContext || window.webkitAudioContext;

const getBaseURL = () => {
	return new URL('.', import.meta.url);
};


class audioPlayerComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode:'open'});
        this.src = this.getAttribute('src');
        this.name = this.getAttribute('name');
        this.playList = [
            {
              url: "",
              author: "Taylor Swift",
              title: "Cardigan",
              index: 1,
            },
            {
              url: "",
              author: "Billie Eilish",
              title: "everything i wanted",
              index: 2,
            },
            {
              url: "",
              author: "Lana Del Rey",
              title: "Mariners Apartment Complex",
              index: 3,
            },
            {
              url: "",
              author: "Ariana Grande",
              title: "pov",
              index: 4,
            }
          ];
          this.currentSong = this.playList[0];
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                #audioplayer {
                    margin: 0 auto;
                    padding: 1em;
                    background: rgba(40, 40, 40,0.7);
                    box-shadow: 0 0 50px black;
                    text-align: center;
                    width: 400px;
                    height: 80%;
                    border-radius: 10px;
                    color: white;
                    font-family: 'Helvetica', sans-serif;
                }

                #player {display: none;}

                #titre {
                    width: 100%;
                    white-space: nowrap;
                    overflow: hidden;
                    box-sizing: border-box;
                }

                h1{
                    display: inline-block;
                    padding-left: 100%;
                    animation: move 15s linear infinite;
                    font-size: 1.5em;
                    font-weight: 100;
                }

                @keyframes move {
                    0%   { transform: translate(0, 0); }
                    100% { transform: translate(-100%, 0); }
                }

                #myCanvas {
                    border: 1px solid black;
                    width: 100%;
                }
                #visualiser {
                    width: 80%;
                    display: block;
                    margin: auto;
                }

                .icons {
                    width: 40px;
                    filter: invert(1);
                }

                .smallIcons {
                    width: 20px;
                    filter: invert(1);
                }

                button {
                    border-radius : 10px;
                    border : none;
                    background-color: transparent;
                }

                button:hover {
                    background-color: #666666b2;
                    box-shadow: 0 0 5px darkgrey;
                }

                .hidden {
                    display: none;
                }

                #time {
                    width: 70%
                }

                .slider {
                    width : 50%;
                    accent-color: white;
                }

                #playercontrol {
                    margin: 2em;
                }

                
            </style>
            <div id="audioplayer">

                <div id="titre">
                    <h1 id="titreH1">${this.currentSong.author} - ${this.currentSong.title}</h1>
                </div>
            
            <audio id="player" src=${this.src} controls crossorigin="anonymous"></audio>
            <br>

            <my-visualiser id="visualiser"></my-visualiser>

            <div id="playercontrol">
            
            <div class="slidecontainer" id="timeSlider">
                <span id="currentTime">00:00</span>
                <input type="range" min="0" value="0" class="slider" id="time">
                <span id="duration">--:--</span>
            </div>

            <div id="control" style="margin: 1em;">
            <button id="back"><img class="icons" src="./audioPlayerComponents/assets/icons/back.png"></button>
            <button id="play"><img class="icons" id="playIcon" src="./audioPlayerComponents/assets/icons/play.png"></button>
            <button id="stop"><img class="icons" src="./audioPlayerComponents/assets/icons/stop.png"></button>
            <button id="next"><img class="icons" src="./audioPlayerComponents/assets/icons/next.png"></button>
            <button id="expand"><img class="icons" id="expandIcon" src="./audioPlayerComponents/assets/icons/expand.png"></button>
            </div>

            <div class="slidecontainer">
                <img class="smallIcons" src="./audioPlayerComponents/assets/icons/mute.png">
                <input type="range" min="1" max="100" value="50" class="slider" id="volume">
                <img class="smallIcons" src="./audioPlayerComponents/assets/icons/volume.png">
            </div>
            
            </div>


            <my-egaliseur id="equalizer"></my-egaliseur>

            </div>
        `;

        this.fixRelativeURLs();
        this.player = this.shadowRoot.querySelector('#player');
        this.player.src = this.currentSong.url;
        this.updateTitle();
        this.visualizer = this.shadowRoot.querySelector('#visualiser');
        this.egaliseur = this.shadowRoot.querySelector('#equalizer');

        this.isPlaying = false;
        this.equalizerExpanded = false;

        
        //Visualiser
        this.audioContext = new AudioContext();
        this.sourceNode =  this.audioContext.createMediaElementSource(this.player);
        this.filters = [];
        this.analyser;

        this.buildAudioGraph();
        this.initAudioContext();

        const shadowRootIndex = this.shadowRoot;
        this.defineListener();

        
    }

    //Mise à jour du texte du titre sur le lecteur
    updateTitle() {
        this.shadowRoot.querySelector('#titreH1').innerHTML = `${this.currentSong.author} - ${this.currentSong.title}`;
    }

    //Mise à jour de la source du lecteur
    updateSong(songIndex) {
        this.currentSong = this.playList[songIndex];
        this.player.src = this.currentSong.url;
        this.updateTitle();
        this.player.play();
    }

    fixRelativeURLs() {
        const baseURL = getBaseURL();
    
        const knobs = this.shadowRoot.querySelectorAll('webaudio-knob');
        for (const knob of knobs) {
          const src = knob.src;
          knob.src =  baseURL  + src;
          console.log("new value : " + knob.src);
        }

        const sliders = this.shadowRoot.querySelectorAll('webaudio-slider');
        for (const slider of sliders) {
          const src = slider.src;
          slider.src =  baseURL  + src;
          slider.knobsrc = baseURL  + slider.knobsrc;
          console.log(slider.src)
        }

      }

    //Initialisation des listener sur les boutons
    defineListener() {
        this.shadowRoot.querySelector("#play").addEventListener('click', () => {
            if(this.isPlaying) {
                this.player.pause();
                this.shadowRoot.querySelector("#playIcon").src = "./audioPlayerComponents/assets/icons/play.png";
                this.isPlaying = false;
            } else {
                this.player.play();
                this.audioContext.resume();
                this.shadowRoot.querySelector("#playIcon").src = "./audioPlayerComponents/assets/icons/pause.png";
                this.isPlaying = true;
        }
        });

        this.shadowRoot.querySelector("#stop").addEventListener('click', () => {
            this.player.pause();
            this.shadowRoot.querySelector("#playIcon").src = "./audioPlayerComponents/assets/icons/play.png";
            this.player.currentTime = 0;
        });

        this.shadowRoot.querySelector("#next").addEventListener('click', () => {
            if(this.currentSongIndex == this.playList.length) {
                this.updateSong(0);
            }
            else {
                this.updateSong(this.currentSong.index + 1);
            }
        });

        this.shadowRoot.querySelector("#back").addEventListener('click', () => {
            if(this.currentSongIndex == 0) {
                this.updateSong(this.playList.length);
            }
            else {
                this.updateSong(this.currentSong.index - 1);
            }
        });

        this.shadowRoot.querySelector("#expand").addEventListener('click', () => {
            if(this.equalizerExpanded == true) {
                this.shadowRoot.querySelector("#expandIcon").src = "./audioPlayerComponents/assets/icons/expand.png";
                this.shadowRoot.querySelector("#egaliseur").classList.add("hidden");
                this.equalizerExpanded = false;
            }

            else {
                this.shadowRoot.querySelector("#expandIcon").src = "./audioPlayerComponents/assets/icons/collapse.png";
                this.shadowRoot.querySelector("#egaliseur").classList.remove("hidden");
                this.equalizerExpanded = true;
            }
        });

        this.shadowRoot.querySelector("#volume").addEventListener('input', (evt) => {
            //console.log(evt.target.value)
            this.player.volume = evt.target.value/100;
        });

        this.player.addEventListener('input', (evt) => {
            this.audioContext.resume();
        });

        this.player.addEventListener('timeupdate', () => {
            let seconds = this.player.currentTime;
            this.shadowRoot.querySelector('#time').value = seconds;

            let minutes = Math.floor(seconds / 60);
            minutes = (minutes >= 10) ? minutes : "0" + minutes;
            seconds = Math.floor(seconds % 60);
            seconds = (seconds >= 10) ? seconds : "0" + seconds;
            this.shadowRoot.querySelector('#currentTime').innerHTML = minutes + ":" + seconds;

        });

        this.player.addEventListener('play', () => {
            let seconds = this.player.duration;
            this.shadowRoot.querySelector('#time').max = seconds;

            let minutes = Math.floor(seconds / 60);
            minutes = (minutes >= 10) ? minutes : "0" + minutes;
            seconds = Math.floor(seconds % 60);
            seconds = (seconds >= 10) ? seconds : "0" + seconds;
            this.shadowRoot.querySelector('#duration').innerHTML = minutes + ":" + seconds;
            
        });

        this.shadowRoot.querySelector('#time').addEventListener('input', () => {
            this.player.currentTime = this.shadowRoot.querySelector('#time').value;
        });
    }

    //Initialisation du contexte audio utilisé par l'egaliseur et le visualiseur
    buildAudioGraph() {
        this.analyser = this.audioContext.createAnalyser();
        
        // Try changing for lower values: 512, 256, 128, 64...
        this.analyser.fftSize = 1024;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        // create the equalizer. It's a set of biquad Filters
        // Set filters
        [60, 170, 350, 1000, 3500, 10000].forEach((freq, i) => {
        var eq = this.audioContext.createBiquadFilter();
        eq.frequency.value = freq;
        eq.type = "peaking";
        eq.gain.value = 0;
        this.filters.push(eq);
        });
      
        // Connect filters in serie
        this.sourceNode.connect(this.filters[0]);
        for(var i = 0; i < this.filters.length - 1; i++) {
        this.filters[i].connect(this.filters[i+1]);
        }
    
        // connect the last filter to the speakers
        this.filters[this.filters.length - 1].connect(this.analyser);

        this.masterGain = this.audioContext.createGain();
        this.masterGain.value = 1;
        this.filters[this.filters.length - 1].connect(this.masterGain);
        this.stereoPanner = this.audioContext.createStereoPanner();
        this.masterGain.connect(this.stereoPanner);
        this.stereoPanner.connect(this.analyser);

         this.analyser.connect(this.audioContext.destination);
    }

    //Transmition des variable pour les components enfants
    initAudioContext() {
        this.visualizer.audioContext = this.audioContext;
        this.visualizer.sourceNode = this.sourceNode;
        this.visualizer.analyser = this.analyser;
        this.visualizer.bufferLength = this.bufferLength;
        this.visualizer.dataArray = this.dataArray;
        this.egaliseur.filters = this.filters;
        this.egaliseur.stereoPanner = this.stereoPanner;
    }
}

  
customElements.define("my-audio-player", audioPlayerComponent);
  