import("stdfaust.lib");

freq = hslider("freq", 73.42, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);

// Saw + sub octave
osc1 = os.sawtooth(freq) * 0.6;
osc2 = os.sawtooth(freq * 0.5) * 0.4;

// Punchy envelope
myenv = en.adsr(0.02, 0.1, 0.6, 0.3, gate);

process = (osc1 + osc2) * myenv * gain;