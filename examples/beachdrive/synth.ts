/*
* (c) Peter Johan Salomonsen 2021
*/

import { cos, outputline, Limiter, TriangleOscillator, FFT, EQBand, TriBandEQ, Pan, SineOscillator, IFFTOscillator, BiQuadFilter, FilterType, Q_BUTTERWORTH, Noise, DelayLine, BandPass,SawOscillator,softclip, midichannels, MidiChannel, MidiVoice, StereoSignal, Freeverb, SineOscillator, Envelope, notefreq, synthState } from '../mixes/globalimports';
import { SAMPLERATE } from '../environment';
import { MasterMe } from '../faust/dsp/master_me';

// Beach-drive game logic — the whole game (state, input, integration) lives here
// in the song. The app/engine knows nothing about cars — it only offers a
// generic `synthState` f32 buffer (relayed to the shader's
// `uniform float synthState[]`) and the per-sample `postprocess()` hook, which
// runs every audio block *including while the sequencer is paused* — so the car
// can be driven with the music stopped. The shader
// (shaders/shader_beachdrive.glsl) reads the same synthState slots.

// One MIDI channel is the game's I/O. Control NOTES drive the car (velocity =
// how hard); obstacle CCs are placed by the sequence. Notes here make no sound.
const GAME_CHANNEL: i32 = 7;   // matches the addInstrument("drive") slot (8th instrument)

let throttle: f32 = 0, brake: f32 = 0, steerL: f32 = 0, steerR: f32 = 0;
let carDistance: f32 = 0, carSpeed: f32 = 0, carX: f32 = 0, gameTime: f32 = 0;

// Silent voice: turns held control notes into gates. noteoff() (also fired by
// the engine's allNotesOff on pause/stop) clears the gate, and super.noteoff()
// sets velocity 0 so isDone() frees the voice.
class CarControlVoice extends MidiVoice {
    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
        const lvl: f32 = (velocity as f32) / 127.0;
        if (note == 36) throttle = lvl;        // c3
        else if (note == 38) brake = lvl;      // d3
        else if (note == 48) steerL = lvl;     // c4
        else if (note == 50) steerR = lvl;     // d4
    }
    noteoff(): void {
        if (this.note == 36) throttle = 0;
        else if (this.note == 38) brake = 0;
        else if (this.note == 48) steerL = 0;
        else if (this.note == 50) steerR = 0;
        super.noteoff();
    }
    nextframe(): void { /* silent */ }
}

// Call this once per sample from postprocess().
export function gameTick(): void {
    const dt: f32 = 1.0 / SAMPLERATE;
    gameTime += dt;

    carSpeed += (10.0 * throttle - 22.0 * brake - 4.0) * dt;   // accel / brake / drag
    if (carSpeed < 0) carSpeed = 0;
    if (carSpeed > 14.0) carSpeed = 14.0;
    carDistance += carSpeed * dt;

    const steer: f32 = steerL - steerR;
    if (steer != 0) carX += steer * 1.5 * dt;
    else if (carX > 0) { carX -= 1.1 * dt; if (carX < 0) carX = 0; }   // ease to centre
    else if (carX < 0) { carX += 1.1 * dt; if (carX > 0) carX = 0; }
    if (carX > 1.0) carX = 1.0;
    if (carX < -1.0) carX = -1.0;

    // Obstacle lanes: CCs set by the sequence, read straight off the channel.
    const cc = midichannels[GAME_CHANNEL].controllerValues;

    // Publish to the generic buffer the shader reads (layout is song-defined):
    synthState[0] = carDistance;
    synthState[1] = carSpeed;
    synthState[2] = carX;
    synthState[3] = gameTime;
    synthState[4] = (cc[20] as f32) / 127.0;   // roadblock lane
    synthState[5] = (cc[21] as f32) / 127.0;   // oncoming-car lane
    synthState[6] = (cc[22] as f32) / 127.0;   // animal lane
}

// In your synth.ts: create the channel in initializeMidiSynth(), and call
// gameTick() from postprocess().
export function initializeGameChannel(): void {
    midichannels[GAME_CHANNEL] = new MidiChannel(8, (ch) => new CarControlVoice(ch));
}

const liveMaster = new MasterMe();

const delayframes = (SAMPLERATE * (6/8) * 60 / 105) as usize;
const echoLeft = new DelayLine(delayframes);
const echoRight = new DelayLine(delayframes);
const echoline = new StereoSignal();

export class AllPass {
  	coeff: f32;
  	previousinput: f32;
  	previousoutput: f32;
  
  	setDelta(delta: f32): void {
      this.coeff = (1 - delta) / (1 + delta);
    }
  
	process(input: f32): f32 {
      const output = this.coeff * (input                                     
                                   	- this.previousoutput)
                                  + this.previousinput;
      this.previousoutput = output;
      this.previousinput = input;
      return output;
    }
}

export class DelayLineFloat {
    buffer: StaticArray<f32>;
    frame: f64 = 0;
  	numframes: f64 = 1;
  	previous: f32;
  	allpass: AllPass = new AllPass();
  
    constructor(private buffersizeframes: i32) {        
        this.buffer = new StaticArray<f32>(buffersizeframes);
    }

    read(): f32 {        
      const index = this.frame as i32 % this.buffer.length;
      return this.allpass.process(this.buffer[index]);
      //return this.buffer[index];
    }
  	
  	setNumFramesAndClear(numframes: f64): void {
      this.numframes = Math.floor(numframes);
      this.allpass.setDelta ( (numframes - this.numframes) as f32 );
      for (var n = this.frame; n<this.frame + numframes;n++) {
        const index = n as i32 % this.buffer.length;
      	this.buffer[index] = 0;
      }
    }

    write_and_advance(value: f32): void {
	  //const index = Math.round((this.frame++) + this.numframes) as i32 % this.buffer.length;
      const index = ((this.frame++) + this.numframes) as i32 % this.buffer.length;

      this.buffer[index] = value;
    }
}

class OnePole { 
  a0: f32 = 1.0;
  b1: f32 = 0.0;
  z1: f32 = 0.0;
    	
  lopass(fc: f32): void {
      this.b1 = Mathf.exp(-2.0 * Mathf.PI * fc / SAMPLERATE);
      this.a0 = 1.0 - this.b1;
  }
  
  hipass(fc: f32): void {
      this.b1 = -Mathf.exp(-2.0 * Mathf.PI * (0.5 - (fc / SAMPLERATE)));
	  this.a0 = 1.0 + this.b1;
  }

  process(val: f32): f32 {
      this.z1 = val * this.a0 + this.z1 * this.b1;
      return this.z1;
  } 
}


class WaveGuide {
  exciter: Noise = new Noise();
  envExciter: Envelope;
  filterExciter: OnePole = new OnePole();
  delay: DelayLineFloat = new DelayLineFloat((SAMPLERATE / notefreq(1)) as i32);
  delay2: DelayLineFloat = new DelayLineFloat((SAMPLERATE / notefreq(1)) as i32);
  filterFeedback: OnePole = new OnePole();
  feedbackLevel: f32;
  feedbackFilterFreq: f32;

  constructor(exciterAttack: f32, exciterRelease: f32, exciterFilterFreq : f32, feedbackLevel: f32) {
    this.envExciter = new Envelope(exciterAttack,
                                   exciterRelease, 0,
                                   exciterRelease);
    this.filterExciter.lopass(exciterFilterFreq);
    
    this.feedbackLevel = feedbackLevel;
  }

  start(freq: f32, feedbackFilterFreq: f32): void {
    const tmpDelay = this.delay;
    this.delay = this.delay2;
    this.delay2 = tmpDelay;

    this.filterFeedback.lopass(feedbackFilterFreq);
    this.feedbackFilterFreq = feedbackFilterFreq;
    this.delay.setNumFramesAndClear(
      (SAMPLERATE  /
       	(freq)
       )
      );
    this.envExciter.val = 0;
    this.envExciter.attack();
  }
  
  stop(): void {
    this.delay.setNumFramesAndClear(1);
    this.delay2.setNumFramesAndClear(1);
  }
 
  process(): f32 {
    const envexciter = this.envExciter.next();
    let exciterSignal: f32 = this.exciter.next() * envexciter;
    exciterSignal = this.filterExciter.process(exciterSignal);

    const feedback = this.delay.read();      	
    let signal = exciterSignal + feedback;

    signal = this.filterFeedback.process(signal);
    this.delay.write_and_advance(          
      signal * this.feedbackLevel
    );
    const delay2 = this.delay2.read();
    this.delay2.write_and_advance(delay2 * 0.9);
	return signal + delay2;
    
  }
}

class Piano extends MidiVoice {
    env: Envelope = new Envelope(0.01, 1, 1.0, 0.2);
  	waveguide1: WaveGuide = new WaveGuide(0.01, 0.01, 200, 0.9999);
  	waveguide2: WaveGuide = new WaveGuide(0.011, 0.1, 100, 0.9999);
  	waveguide3: WaveGuide = new WaveGuide(0.012, 0.22, 50, 0.9999);
  	  
  	
    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
      	const freq = notefreq(note);
      	this.waveguide1.start(freq, freq * 6500 / Mathf.pow(note, 1.33) );
      	this.waveguide2.start(freq , freq * 6500 / Mathf.pow(note, 1.33) );
      	this.waveguide3.start(freq , freq * 6500 / Mathf.pow(note, 1.33) );      	
      	
      	this.env.attack();   
    }

    noteoff(): void {
        this.env.release();
    }

    isDone(): boolean {
      const ret = this.env.isDone();
      if(ret) {
        this.waveguide1.stop();
        this.waveguide2.stop();
        this.waveguide3.stop();
      }
      return ret;
    }

    nextframe(): void {
        const env = this.env.next();
      
      	const wg1: f32 = this.waveguide1.process();
		const wg2: f32 = this.waveguide2.process();
      	const wg3: f32 = this.waveguide3.process();
              
      	const velocity = env * this.velocity / 8;
       	this.channel.signal.add(
          (wg1 + wg2 + wg3) * velocity , 
          (wg1 * wg2 + wg3) * velocity
        );
        
    }
}

class String extends MidiVoice {
    env: Envelope = new Envelope(0.2, 1, 0.9, 0.5);
  	waveguide1: WaveGuide = new WaveGuide(0.1, 20.0, 70, 1);
  	waveguide2: WaveGuide = new WaveGuide(0.1, 20.0, 70, 1);
  	filterLeft: OnePole = new OnePole();
  	filterRight: OnePole = new OnePole();
  	
    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
      	const freq = notefreq(note-12);
      	this.waveguide1.start(freq, freq * 10000 / Mathf.pow(note, 1.5) );
      	this.waveguide2.start(freq, freq * 10000 / Mathf.pow(note, 1.5) );
      	this.env.attack();   
      	this.filterLeft.lopass(2500);
      	this.filterRight.lopass(2500);
    }

    noteoff(): void {
        this.env.release();
    }

    isDone(): boolean {
      const ret = this.env.isDone();
      if(ret) {
      	this.waveguide1.stop();
        this.waveguide2.stop();
      }
      return ret;
    }

    nextframe(): void {
        const env:f32 = this.env.next() * this.velocity * 0.1;
      	const left = this.filterLeft.process(
          		this.waveguide1.process()              	
              )
        	* env;
      	const right = this.filterRight.process(
          		this.waveguide1.process()              	
              )
        	* env;
       	this.channel.signal.add(
          left, right
        );
        
    }
}

class Brass extends MidiVoice {
    env: Envelope = new Envelope(0.01, 1.0, 1.0, 0.1);
  	waveguide1: WaveGuide = new WaveGuide(0.02, 0.15, 1000, 0.99999);  	
  	waveguide2: WaveGuide = new WaveGuide(0.03, 0.2, 5000, 1.0);  	
  	
    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
      	const freq = notefreq(note);
      	this.waveguide1.start(freq, freq * 10);
      	this.waveguide2.start(freq, freq * 8);
      	this.env.attack();   
    }

    noteoff(): void {
        this.env.release();
    }

    isDone(): boolean {
      const ret = this.env.isDone();
      if(ret) {
      	this.waveguide1.stop();
        this.waveguide2.stop();
      }
      return ret;
    }

    nextframe(): void {
        const env = this.env.next();
      	let signal = (
          		this.waveguide1.process()  +
          		this.waveguide2.process()
              )
        	* env * this.velocity / 24 as f32;
       	this.channel.signal.add(
          signal, signal
        );
        
    }
}

class Guitar extends MidiVoice {
    env: Envelope = new Envelope(0.02, 1, 1.0, 0.1);
  	waveguide1: WaveGuide = new WaveGuide(0.005, 0.01, 800, 0.9999);
  	
  	
    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
      	const freq = notefreq(note);
      	this.waveguide1.start(freq, freq * 3500 / Mathf.pow(note, 1.3) );
      	this.env.attack();   
    }

    noteoff(): void {
        this.env.release();
    }

    isDone(): boolean {
      const ret = this.env.isDone();
      if(ret) {
      	this.waveguide1.stop();
      }
      return ret;
    }

    nextframe(): void {
        const env = this.env.next();
      	const signal = (
          		this.waveguide1.process()              	
              )
        	* env * this.velocity / 8 as f32;
       	this.channel.signal.add(
          signal, signal
        );
        
    }
}

class GuitarChannel extends MidiChannel {
  lopass: BiQuadFilter = new BiQuadFilter();
  lfo: SineOscillator = new SineOscillator();
  bandpass: BandPass = new BandPass(220,2000);
  feedback: f32 = 0;

  preprocess(): void {
    let signal = this.signal.left;
    
    const feedback = this.feedback;
    
    
    this.lfo.frequency = 4;
    const lfo = this.lfo.next() + 1.0;
    
    this.lopass.update_coeffecients(FilterType.LowPass, SAMPLERATE,
                          800 + (lfo * 6000), Q_BUTTERWORTH);
    signal = softclip(signal * 0.3);
    signal = this.lopass.process(signal);
    this.feedback += this.bandpass.process(signal * 0.8);
	signal += feedback;
    signal *= 0.5;
    echoline.left += (signal * 0.5);
    echoline.right += (signal * 0.5);
    this.signal.left = signal;
    this.signal.right = signal;
  }
}


class Bass extends MidiVoice {
    env: Envelope = new Envelope(0.1, 1, 1.0, 0.1);
  	waveguide1: WaveGuide = new WaveGuide(0.04, 0.01, 300, 0.999999);
  	
  	
    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
      	const freq = notefreq(note);
      	this.waveguide1.start(freq, freq * 7);
      	this.env.attack();   
    }

    noteoff(): void {
        this.env.release();
    }

    isDone(): boolean {
      const ret = this.env.isDone();
      if(ret) {
      	this.waveguide1.stop();
      }
      return ret;
    }

    nextframe(): void {
        const env = this.env.next();
      	const signal = (
          		this.waveguide1.process()              	
              )
        	* env * this.velocity / 2 as f32;
       	this.channel.signal.add(
          signal, signal
        );
        
    }
}

class TubeLead extends MidiVoice {
    env: Envelope = new Envelope(0.1, 1, 1.0, 0.1);
  	waveguide1: WaveGuide = new WaveGuide(0.005, 0.01, 4000, -0.9999);
  	
  	
    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
      	const freq = notefreq(note);
      	this.waveguide1.start(freq, freq * 7);
      	this.env.attack();   
    }

    noteoff(): void {
        this.env.release();
    }

    isDone(): boolean {
      const ret = this.env.isDone();
      if(ret) {
      	this.waveguide1.stop();
      }
      return ret;
    }

    nextframe(): void {
        const env = this.env.next();
      	const signal = (
          		this.waveguide1.process()              	
              )
        	* env * this.velocity * 0.15 as f32;
       	this.channel.signal.add(
          signal, signal
        );
        
    }
}

class TubeLeadChannel extends MidiChannel {
  
  preprocess(): void {
    let signal = this.signal.left;
    
    echoline.left += (signal * 0.3);
    echoline.right += (signal * 0.3);
    this.signal.left = signal;
    this.signal.right = signal;
  }
}

export class Hihat extends MidiVoice {
    env: Envelope = new Envelope(0.0001, 1, 1.0, 0.1);
  	waveguide1: WaveGuide = new WaveGuide(0.005, 0.05, 19000, 0.05);
  	
  	constructor(channel: MidiChannel) {
       super(channel);
      this.minnote = 66;
      this.maxnote = 66;
    }
 
    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
      	const freq: f32 = 5000;
      	this.waveguide1.start(freq, 19000);
      	this.env.attack();   
    }

    noteoff(): void {
        this.env.release();
    }

    isDone(): boolean {
      const ret = this.env.isDone();
      if(ret) {
      	this.waveguide1.stop();
      }
      return ret;
    }

    nextframe(): void {
        const env = this.env.next();
      	const signal = (
          		this.waveguide1.process()              	
              )
        	* env * this.velocity * 0.006 as f32;
       	this.channel.signal.add(
          signal, signal
        );
        
    }
}

export class Kick2 extends MidiVoice {
    env: Envelope = new Envelope(0.0001, 1, 1.0, 0.1);
  	waveguide1: WaveGuide = new WaveGuide(0.005, 0.06, 60, 0.1);
  	
  	constructor(channel: MidiChannel) {
       super(channel);
      this.minnote = 60;
      this.maxnote = 60;
    }
 
    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
      	const freq: f32 = 40;
      	this.waveguide1.start(freq, 300);
      	this.env.attack();   
    }

    noteoff(): void {
        this.env.release();
    }

    isDone(): boolean {
      const ret = this.env.isDone();
      if(ret) {
      	this.waveguide1.stop();
      }
      return ret;
    }

    nextframe(): void {
        const env = this.env.next();
      	const signal = (
          		this.waveguide1.process()              	
              )
        	* env * this.velocity as f32;
       	this.channel.signal.add(
          signal, signal
        );
        
    }
}

export class Snare2 extends MidiVoice {
    env: Envelope = new Envelope(0.0001, 1, 1.0, 0.1);
  	waveguide1: WaveGuide = new WaveGuide(0.005, 0.1, 7000, 0.1);
  	
  	constructor(channel: MidiChannel) {
       super(channel);
      this.minnote = 62;
      this.maxnote = 62;
    }
 
    noteon(note: u8, velocity: u8): void {
        super.noteon(note, velocity);
      	const freq: f32 = 400;
      	this.waveguide1.start(freq, 900);
      	this.env.attack();   
    }

    noteoff(): void {
        this.env.release();
    }

    isDone(): boolean {
      const ret = this.env.isDone();
      if(ret) {
      	this.waveguide1.stop();
      }
      return ret;
    }

    nextframe(): void {
        const env = this.env.next();
      	const signal = (
          		this.waveguide1.process()              	
              )
        	* env * this.velocity * 0.05 as f32;
       	this.channel.signal.add(
          signal, signal
        );
        
    }
}
  


export function initializeMidiSynth(): void {
  midichannels[0] = new MidiChannel(10, (ch) => new Piano(ch)); 
  midichannels[0].controlchange(7, 80);
  midichannels[0].controlchange(10, 75);
  midichannels[0].controlchange(91, 0);
  midichannels[1] = new MidiChannel(15, (ch) => new String(ch)); 
  midichannels[1].controlchange(7,45);
  midichannels[1].controlchange(10, 64);
  midichannels[1].controlchange(91, 80);
  midichannels[2] = new MidiChannel(3, (ch, ndx) => {
    switch(ndx) {
      case 1:
        return new Hihat(ch);
      case 2:
        return new Snare2(ch);
      default:
        return new Kick2(ch);
    }
  });
  midichannels[2].controlchange(7, 100);
  midichannels[2].controlchange(91, 20);
  midichannels[3] = new MidiChannel(4, (ch) => new Brass(ch)); 
  midichannels[3].controlchange(7, 52);
  midichannels[3].controlchange(10, 50);
  midichannels[3].controlchange(91, 30);
  midichannels[4] = new GuitarChannel(10, (ch) => new Guitar(ch)); 
  midichannels[4].controlchange(7, 105);
  midichannels[4].controlchange(10, 45);
  midichannels[4].controlchange(91, 30);
  midichannels[5] = new MidiChannel(2, (ch) => new Bass(ch)); 
  midichannels[5].controlchange(7, 105);
  midichannels[5].controlchange(10, 80);
  midichannels[5].controlchange(91, 20);
  midichannels[6] = new TubeLeadChannel(5, (ch) => new TubeLead(ch));
  midichannels[6].controlchange(7, 60);
  midichannels[6].controlchange(10, 40);
  midichannels[6].controlchange(91, 20);
  initializeGameChannel();   // game I/O on channel 7 (silent control voices) = the 'drive' instrument
}

export class MultiBandEQ {
  	bands: StaticArray<EQBand>;
  
    constructor(freqs: f32[]) {
        this.bands = new StaticArray<EQBand>(freqs.length - 1);
      	for ( let n=1; n<freqs.length; n++) {
          this.bands[n-1] = new EQBand(freqs[n-1], freqs[n]);
        }
    }


    process(signal: f32, levels: f32[]): f32 {
        let ret: f32 = 0;
      	for (let n = 0;n<this.bands.length; n++) {
          ret += this.bands[n].process(signal) * levels[n];
        }
      	return ret;
    }
}

const eqfreqs: f32[] = [20,60,290,12000,19000]
//const eqlevels: f32[] = [1.0, 1.0, 1.0, 1.0];
const eqlevels: f32[] = [0.3, 0.92, 0.9, 1.0];

const eqleft = new MultiBandEQ(eqfreqs);
const eqright = new MultiBandEQ(eqfreqs);


export function postprocess(): void {
  gameTick();   // advance the game every sample (runs even when paused)
  const gain: f32 = 0.4;
  let left = outputline.left;
  let right = outputline.right;
  
  
  const echol = echoLeft.read() * 0.2;
  const echor = echoRight.read() * 0.2;

  echoLeft.write_and_advance(echol + echoline.left);
  echoRight.write_and_advance(echor + echoline.right);
  
  left+=echol;
  right+=echor;
  
  left = eqleft.process(left, eqlevels);
  right = eqright.process(right, eqlevels);
  
  left*=gain;
  right*=gain;
  
  outputline.left = left;
  outputline.right = right;
  echoline.clear();
  liveMaster.process(outputline.left, outputline.right);
  outputline.left = liveMaster.signal.left;
  outputline.right = liveMaster.signal.right;
}
