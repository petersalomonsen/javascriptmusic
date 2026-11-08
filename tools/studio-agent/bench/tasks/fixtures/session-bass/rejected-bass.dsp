import("stdfaust.lib");

// Standard MIDI voice controls
freq = hslider("freq", 110, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);

// Tuneable parameters from the brief
fenv_attack = hslider("fenv_attack", 0.18, 0.01, 1.0, 0.01);
cutoff_sweep = hslider("cutoff_sweep", 2200, 100, 10000, 1);
drive = hslider("drive", 2.4, 0.1, 10.0, 0.1);
sustain = hslider("sustain", 0.6, 0.0, 1.0, 0.01);

// Filter envelope — opens the filter on attack, decays to sustain
filterEnv = en.adsr(fenv_attack, 0.15, sustain, 0.3, gate);

// Amplitude envelope
ampEnv = en.adsr(0.01, 0.15, sustain, 0.3, gate);

// Oscillators: sawtooth + sine (one octave apart for thickness)
saw = os.sawtooth(freq);
sine = os.osc(freq / 2);  // sub octave for weight
oscMix = saw + sine;

// Envelope-swept resonant lowpass
// Base cutoff ~300 Hz, swept up by envelope * sweep range
baseCutoff = 300;
cutoff = baseCutoff + filterEnv * cutoff_sweep;
q = 2.5;

filtered = fi.resonlp(cutoff, q, 1) ~ oscMix;

// Saturation (soft clip with adjustable drive)
sat(x) = x * drive / (1 + abs(x * drive));
saturated = sat(filtered);

// Final output: saturation * amp envelope * gain
process = (saturated * ampEnv * gain);