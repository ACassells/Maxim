/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 Mick Grierson, Matthew Yee-King, Marco Gillies
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var mtof = [0, 8.661957, 9.177024, 9.722718, 10.3, 10.913383, 11.562325, 12.25, 12.978271, 13.75, 14.567617, 15.433853, 16.351599, 17.323914, 18.354048, 19.445436, 20.601723, 21.826765, 23.124651, 24.5, 25.956543, 27.5, 29.135235, 30.867706, 32.703197, 34.647827, 36.708096, 38.890873, 41.203445, 43.65353, 46.249302, 49., 51.913086, 55., 58.27047, 61.735413, 65.406395, 69.295654, 73.416191, 77.781746, 82.406891, 87.30706, 92.498604, 97.998856, 103.826172, 110., 116.540939, 123.470825, 130.81279, 138.591309, 146.832382, 155.563492, 164.813782, 174.61412, 184.997208, 195.997711, 207.652344, 220., 233.081879, 246.94165, 261.62558, 277.182617, 293.664764, 311.126984, 329.627563, 349.228241, 369.994415, 391.995422, 415.304688, 440., 466.163757, 493.883301, 523.25116, 554.365234, 587.329529, 622.253967, 659.255127, 698.456482, 739.988831, 783.990845, 830.609375, 880., 932.327515, 987.766602, 1046.502319, 1108.730469, 1174.659058, 1244.507935, 1318.510254, 1396.912964, 1479.977661, 1567.981689, 1661.21875, 1760., 1864.655029, 1975.533203, 2093.004639, 2217.460938, 2349.318115, 2489.015869, 2637.020508, 2793.825928, 2959.955322, 3135.963379, 3322.4375, 3520., 3729.31, 3951.066406, 4186.009277, 4434.921875, 4698.63623, 4978.031738, 5274.041016, 5587.651855, 5919.910645, 6271.926758, 6644.875, 7040., 7458.620117, 7902.132812, 8372.018555, 8869.84375, 9397.272461, 9956.063477, 10548.082031, 11175.303711, 11839.821289, 12543.853516, 13289.75];
var context;
if ( typeof webkitAudioContext !== "undefined") {
  context = new webkitAudioContext();
}

function Maxim(t) {

  if (context) {

    this.loadFile = function(filename) {
      var baseAudio = new BaseAudio();
      var xhr = new XMLHttpRequest();
      xhr.open('GET', filename, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function() {
        context.decodeAudioData(xhr.response, function(buffer) {
          baseAudio.audioBuffer = buffer;
          baseAudio.analyser = context.createAnalyser();
        });
      }
      xhr.send();
      return baseAudio;
    }

    this.loadLocalFile = function(songString) {
      var baseAudio = new BaseAudio();
      context.decodeAudioData(songString, function(buffer) {
        baseAudio.audioBuffer = buffer;
        baseAudio.analyser = context.createAnalyser();
      });
      return baseAudio;
    }
  }

  function BaseAudio() {
    this.source;
    this.isLooping = false;
    this.analysing = false;
    this.startTime = 0;
    this.currentSpeed = 1.0;
    this.sampleLength = 1.0;
    // check that sample length is set correctly
    this.pVolume = 1.0;
    this.envTime = 1.0;
    this.gainNode
    this.filterNode
    this.audioBuffer
    this.analyser
    this.FFTData
    this.flux = 0;
    this.averageSpectrumPower = 0;
  }


  BaseAudio.prototype.isPlaying = function() {
    if (this.source) {
      return this.source.playbackState == this.source.SCHEDULED_STATE || this.source.playbackState == this.source.PLAYING_STATE;
    } else {
      return false;
    }
  }

  BaseAudio.prototype.setLooping = function(loopState) {
    this.isLooping = loopState;
  }

  BaseAudio.prototype.cue = function(time) {
    this.startTime = time / 1000;
  }

  BaseAudio.prototype.speed = function(speed) {
    if (this.source) {
      this.currentSpeed = speed;
      this.source.playbackRate.value = speed;
    }
  }

  BaseAudio.prototype.getLengthMs = function() {
    if (this.source) {
      return this.sampleLength;
    }
  }

  BaseAudio.prototype.volume = function(gain) {
    this.pVolume = gain;
    if (this.isPlaying()) {
      this.gainNode.gain.value = pVolume;
    }
  }

  BaseAudio.prototype.play = function() {
    //if (this.source) {
    if (!this.isPlaying()) {
      this.source = context.createBufferSource();
      this.gainNode = context.createGainNode()
      this.filter = context.createBiquadFilter();
      this.filter.type = 0;
      this.filter.frequency.value = 20000;
      this.envTime = 1.0;
      this.source.buffer = this.audioBuffer;
      this.source.playbackRate.value = this.currentSpeed;
      this.sampleLength = this.source.buffer.duration * 1000;
      this.source.connect(this.filter);
      this.filter.connect(this.gainNode);
      this.gainNode.connect(context.destination);
      this.gainNode.gain.value = this.pVolume;
      if (this.isLooping) this.source.loop = true;
      this.source.noteGrainOn(0, this.startTime, this.source.buffer.duration - this.startTime);
    }
    if (this.analysing == true) {
      this.gainNode.connect(this.analyser);
      this.FFTData = new Float32Array(this.analyser.frequencyBinCount);
      // hmmm not sure about this line
      this.analyser.getFloatFrequencyData(this.FFTData);
    }
  }

  BaseAudio.prototype.stop = function() {
    if (this.source) {
      this.source.noteOff(0);
    }
  }

  BaseAudio.prototype.setFilter = function(freq, res) {

    this.filter.frequency.value = freq;
    this.filter.Q.value = res;
  }

  BaseAudio.prototype.filterRamp = function(freq, envTime) {
    this.filter.frequency.cancelScheduledValues(context.currentTime);
    this.filter.frequency.linearRampToValueAtTime(filter.frequency.value, context.currentTime);
    // THIS IS THE CHANGE FROM PREVIOUS CODE EXAMPLE
    this.filter.frequency.linearRampToValueAtTime(freq, context.currentTime + envTime / 1000.);
  }

  BaseAudio.prototype.setAmplitude = function(amplitude) {
    this.gainNode.gain.cancelScheduledValues(context.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(gainNode.gain.value, context.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(amplitude, context.currentTime + 10);
  }

  BaseAudio.prototype.ramp = function(amplitude, envTime) {
    this.gainNode.gain.cancelScheduledValues(context.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(gainNode.gain.value, context.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(amplitude, context.currentTime + envTime / 1000.);
  }

  BaseAudio.prototype.getAveragePower = function() {
    this.averageSpectrumPower = 0
    for (var i = 0; i < this.analyser.frequencyBinCount; i++) {

      this.averageSpectrumPower += this.FFTData[i]
    }
    return (100 + (this.averageSpectrumPower / this.analyser.frequencyBinCount)) * 0.01;
  }

  BaseAudio.prototype.getFlux = function() {
    this.flux = 0;
    var FFTData1 = new Float32Array(analyser.frequencyBinCount);
    for (var i = 0; i < this.analyser.frequencyBinCount; i++) {

      this.flux += this.FFTData[i] - FFTData1[i];
    }
    FFTData1 = this.FFTData;
    return (100 + (this.flux / this.analyser.frequencyBinCount)) * 0.01;
  }
  
  
  // ADDED FOR BACKWARD COMPATABILITY
  BaseAudio.prototype.setAnalysing = function(analysing_) {
      this.analysing = analysing_;
  }
}









//This is the constructor for our waveform generator.
Synth = function() {
  var that = this;
  this.phase = 0;
  this.context = context;
  this.node = context.createJavaScriptNode(512, 2, 2);
  this.node.onaudioprocess = function(audioContext) {
    that.process(audioContext)
  };
  this.sample_rate = 44100;
  this.frequency = 220;
  this.amplitude = 1.0;
  this.gainNode = context.createGainNode();
  this.delayGain = context.createGainNode();
  this.filter = context.createBiquadFilter();
  this.delay = context.createDelayNode(2);
  this.delayAmt = 0.75;
  this.delayGain.gain.value = 0.75;
  this.filter.type = 0;
  this.envTime = 1.0;
  this.isPlaying = false;
  this.waveFormSize = 514;
  this.wave = new Array(this.waveFormSize);

  for (var i = 0; i < this.waveFormSize + 1; i++) {

    this.wave[i] = Math.sin(i / (this.waveFormSize - 2) * (Math.PI * 2));
  }
}

Synth.prototype.waveTableSize = function(size) {

  this.waveFormSize = size;
}

Synth.prototype.loadWaveTable = function(waveTable) {

  for (var i = 0; i < this.waveFormSize; i++) {

    this.wave[i] = waveTable[i];
  }
  //  alert("all done");
}
//This function is the waveform generator's buffer method
//Hack here to create new waveforms
Synth.prototype.process = function(audioContext) {
  var data = audioContext.outputBuffer.getChannelData(0);
  for (var i = 0; i < data.length; i++) {
    var remainder;
    this.phase += (this.waveFormSize - 2) / (this.sample_rate / this.frequency);
    if (this.phase >= (this.waveFormSize - 3))
      this.phase -= (this.waveFormSize - 2);
    remainder = this.phase - Math.floor(this.phase);
    data[i] = (1 - remainder) * this.wave[1 + Math.floor(this.phase)] + remainder * this.wave[2 + Math.floor(this.phase)];
  }
  //  console.log('data = ' + this.frequency);
}
//This function allows you to 'play' the waveform
Synth.prototype.play = function() {
  this.node.connect(this.filter);
  this.filter.connect(this.gainNode);
  this.gainNode.connect(this.context.destination);
  this.gainNode.connect(this.delay);
  this.delay.connect(this.delayGain);
  this.delayGain.connect(this.delay);
  this.delay.connect(this.context.destination);
  this.isPlaying = true;
}
//This function allows you to set the frequency of the waveform
Synth.prototype.setFrequency = function(frequency) {
  this.frequency = frequency;
}
//This function allows you to set the amplitude of the waveform
Synth.prototype.setAmplitude = function(amplitude) {

  this.gainNode.gain.cancelScheduledValues(context.currentTime);
  this.gainNode.gain.linearRampToValueAtTime(this.gainNode.gain.value, context.currentTime);
  this.gainNode.gain.linearRampToValueAtTime(amplitude, context.currentTime + 10);
}

Synth.prototype.ramp = function(amplitude, envTime) {

  this.gainNode.gain.cancelScheduledValues(context.currentTime);
  this.gainNode.gain.linearRampToValueAtTime(this.gainNode.gain.value, context.currentTime);
  this.gainNode.gain.linearRampToValueAtTime(amplitude, context.currentTime + envTime / 1000.);
}
//This allows us to stop the waveform generator
Synth.prototype.stop = function() {
  this.node.disconnect();
  this.isPlaying = false;
}

Synth.prototype.setDelayTime = function(t) {

  this.delay.delayTime.value = t;

}

Synth.prototype.setDelayAmount = function(t) {

  this.delayGain.gain.value = t;

  //  this.delayGain.gain.cancelScheduledValues(context.currentTime);
  //  this.delayGain.gain.linearRampToValueAtTime(this.delayGain.gain.value, context.currentTime);
  //  this.delayGain.gain.linearRampToValueAtTime(this.delayGain.gain.value, context.currentTime,100);

}

Synth.prototype.setFilter = function(freq, res) {

  this.filter.frequency.value = freq;
  this.filter.Q.value = res;
}

Synth.prototype.filterRamp = function(freq, envTime) {

  this.filter.frequency.cancelScheduledValues(context.currentTime);
  this.filter.frequency.linearRampToValueAtTime(this.filter.frequency.value, context.currentTime);
  // THIS IS THE CHANGE FROM PREVIOUS CODE EXAMPLE
  this.filter.frequency.linearRampToValueAtTime(freq, context.currentTime + envTime / 1000.);
  //  this.filter.frequency.value = freq;
  //  this.filter.Q.value = res;
}