import { SAMPLERATE } from "../environment";
import { DelayLineFloat } from "../fx/delayline";
import { MonoAudioPlayer } from "../midi/instruments/audioplayer";
import { BiQuadFilter, FilterType, LoPassBiQuadFilter, Q_BUTTERWORTH } from "./biquad";
import { Envelope } from "./envelope.class";
import { notefreq } from "./note";

let seed: i32 = 1;

export function noise(): f32 {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return ((seed as f32 % 1000000 / 1000000) - 0.5) as f32;
}

export class WaveGuide {
    envExciter: Envelope;
    filterExciter: BiQuadFilter = new BiQuadFilter();
    delay: DelayLineFloat = new DelayLineFloat((SAMPLERATE / notefreq(1)) as i32);
    filterFeedback: BiQuadFilter = new BiQuadFilter();
    feedbackLevel: f32;
    feedbackFilterFreq: f32;
    freq: f32;
    exciterenvlevel: f32;

    constructor(exciterAttack: f32, exciterRelease: f32, exciterFilterFreq: f32, feedbackLevel: f32) {
        this.envExciter = new Envelope(exciterAttack,
            exciterRelease, 0,
            exciterRelease);
        this.filterExciter.update_coeffecients(FilterType.LowPass, SAMPLERATE,
            exciterFilterFreq, Q_BUTTERWORTH);

        this.feedbackLevel = feedbackLevel;
    }

    setFilterExciterFreq(freq: f32): void {
        this.filterExciter.update_coeffecients(FilterType.LowPass, SAMPLERATE,
            freq, Q_BUTTERWORTH);

    }

    start(freq: f32, feedbackFilterFreq: f32): void {
        if (freq != this.freq) {
            this.freq = freq;
            const maxFeedbackFilterFreq: f32 = 20000;
            if (feedbackFilterFreq > maxFeedbackFilterFreq as f32) {
                feedbackFilterFreq = maxFeedbackFilterFreq as f32;
            } else if (feedbackFilterFreq < 10) {
                feedbackFilterFreq = 10;
            }
            this.filterFeedback.update_coeffecients(FilterType.LowPass, SAMPLERATE,
                feedbackFilterFreq, Q_BUTTERWORTH);

            this.filterFeedback.coeffs.calculatePhaseAndMagnitudeForFreq(freq);
            const filterphase = this.filterFeedback.coeffs.phaseSamples;

            this.filterFeedback.clearBuffers();            
            this.filterExciter.clearBuffers();

            this.feedbackFilterFreq = feedbackFilterFreq;
            this.delay.setNumFramesAndClear(
                (SAMPLERATE /
                    (freq)
                ) - filterphase
            );
            this.envExciter.val = 0;

        }
        this.exciterenvlevel = 1;
        this.envExciter.attack();

    }

    process(): f32 {
        const envexciter = this.envExciter.next() * this.exciterenvlevel;
        let exciterSignal: f32 = noise() * envexciter;
        exciterSignal = this.filterExciter.process(exciterSignal);

        const feedback = this.delay.read();
        let signal = exciterSignal + feedback;

        signal = this.filterFeedback.processForm2(signal);
        this.delay.write_and_advance(
            signal * this.feedbackLevel
        );
        return signal;

    }
}

export class AuxExciterWaveGuide {
    delay: DelayLineFloat = new DelayLineFloat((SAMPLERATE / notefreq(1)) as i32);
    filterFeedback: BiQuadFilter = new BiQuadFilter();
    feedbackFilterFreq: f32;
    feedbackLevel: f32;
    freq: f32;

    constructor(public exciter: WaveGuide) {

    }

    start(freq: f32, feedbackFilterFreq: f32): void {
        if (freq != this.freq) {
            this.freq = freq;
            const maxFeedbackFilterFreq: f32 = 20000;
            if (feedbackFilterFreq > maxFeedbackFilterFreq as f32) {
                feedbackFilterFreq = maxFeedbackFilterFreq as f32;
            } else if (feedbackFilterFreq < 10) {
                feedbackFilterFreq = 10;
            }
            this.filterFeedback.update_coeffecients(FilterType.LowPass, SAMPLERATE,
                feedbackFilterFreq, Q_BUTTERWORTH);
            this.filterFeedback.coeffs.calculatePhaseAndMagnitudeForFreq(freq);
            const filterphase: f32 = this.filterFeedback.coeffs.phaseSamples;

            this.filterFeedback.clearBuffers();
            
            this.feedbackFilterFreq = feedbackFilterFreq;
            this.delay.setNumFramesAndClear(
                (SAMPLERATE /
                    (freq)
                ) - filterphase
            );

        }
    }

    process(): f32 {
        let exciterSignal: f32 = this.exciter.process();

        const feedback = this.delay.read();
        let signal = exciterSignal + feedback;

        signal = this.filterFeedback.processForm2(signal);
        this.delay.write_and_advance(
            signal * this.feedbackLevel
        );
        return signal;
    }
}

export class AudioExciterWaveGuide {
    delay: DelayLineFloat = new DelayLineFloat((SAMPLERATE / notefreq(1)) as i32);
    filterFeedback: BiQuadFilter = new BiQuadFilter();
    exciterFilter: LoPassBiQuadFilter = new LoPassBiQuadFilter();
    feedbackFilterFreq: f32;
    feedbackLevel: f32;
    freq: f32;

    constructor(public exciter: MonoAudioPlayer) {

    }

    start(freq: f32, feedbackFilterFreq: f32): void {
        this.exciter.restart();
        if (freq != this.freq) {
            this.freq = freq;
            const maxFeedbackFilterFreq: f32 = 20000;
            if (feedbackFilterFreq > maxFeedbackFilterFreq as f32) {
                feedbackFilterFreq = maxFeedbackFilterFreq as f32;
            } else if (feedbackFilterFreq < 10) {
                feedbackFilterFreq = 10;
            }
            this.filterFeedback.update_coeffecients(FilterType.LowPass, SAMPLERATE,
                feedbackFilterFreq, Q_BUTTERWORTH);
            this.filterFeedback.coeffs.calculatePhaseAndMagnitudeForFreq(freq);
            const filterphase: f32 = this.filterFeedback.coeffs.phaseSamples;

            this.filterFeedback.clearBuffers();

            this.feedbackFilterFreq = feedbackFilterFreq;
            this.delay.setNumFramesAndClear(
                (SAMPLERATE /
                    (freq)
                ) - filterphase
            );
        }
    }

    process(): f32 {
        let exciterSignal: f32 = this.exciter.nextframe();
        exciterSignal = this.exciterFilter.process(exciterSignal);

        const feedback = this.delay.read();
        let signal = exciterSignal + feedback;

        signal = this.filterFeedback.processForm2(signal);
        this.delay.write_and_advance(
            signal * this.feedbackLevel
        );
        return signal;
    }
}

export class CustomExciterWaveGuide {
    delay: DelayLineFloat = new DelayLineFloat((SAMPLERATE / notefreq(1)) as i32);
    filterFeedback: BiQuadFilter = new BiQuadFilter();
    feedbackFilterFreq: f32;
    feedbackLevel: f32;
    freq: f32;
    exciterSignal: f32;

    start(freq: f32, feedbackFilterFreq: f32): void {
        if (freq != this.freq) {
            this.freq = freq;
            const maxFeedbackFilterFreq: f32 = 20000;
            if (feedbackFilterFreq > maxFeedbackFilterFreq as f32) {
                feedbackFilterFreq = maxFeedbackFilterFreq as f32;
            } else if (feedbackFilterFreq < 10) {
                feedbackFilterFreq = 10;
            }
            this.filterFeedback.update_coeffecients(FilterType.LowPass, SAMPLERATE,
                feedbackFilterFreq, Q_BUTTERWORTH);
            this.filterFeedback.coeffs.calculatePhaseAndMagnitudeForFreq(freq);
            const filterphase: f32 = this.filterFeedback.coeffs.phaseSamples;

            this.filterFeedback.clearBuffers();
            
            this.feedbackFilterFreq = feedbackFilterFreq;
            this.delay.setNumFramesAndClear(
                (SAMPLERATE /
                    (freq)
                ) - filterphase
            );
        }
    }

    process(): f32 {
        const feedback = this.delay.read();
        let signal = this.exciterSignal + feedback;

        signal = this.filterFeedback.processForm2(signal);
        this.delay.write_and_advance(
            signal * this.feedbackLevel
        );
        return signal;
    }
}