import("stdfaust.lib");

// Controls
gate = button("gate");
gain = hslider("gain", 0.9, 0, 1, 0.01);
tune = hslider("tune", 50, 30, 80, 0.01);

// Pitch sweep for punch - starts high, sweeps down quickly
pitch_env = 1 + 4 * en.ar(0.001, 0.12, gate);
pitch = tune * pitch_env;

// Kick body - sine oscillator with pitch envelope
body = os.osc(pitch);

// Noise click for the attack transient
click = no.noise : fi.highpass(4, 4000);

// Envelopes - one-shot for both
body_env = en.ar(0.001, 0.25, gate);
click_env = en.ar(0.001, 0.04, gate);

// Soft saturation (tanh-like waveshaper)
sat(x) = x / (1 + abs(x));

// Mix: body provides the low-end punch, click adds the transient
mixed = sat(body * body_env * 0.9 + click * click_env * 0.5);

// Final gain
process = mixed * gain * 5;