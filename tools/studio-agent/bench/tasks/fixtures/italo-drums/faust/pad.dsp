import("stdfaust.lib");

freq = hslider("freq", 293.66, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.4, 0, 1, 0.01);

// Detuned dual saws for fatness
osc1 = os.sawtooth(freq) * 0.5;
osc2 = os.sawtooth(freq * 1.005) * 0.5;

// Slow attack, long sustain, slow release for pad character
myenv = en.adsr(0.3, 0.2, 0.8, 0.4, gate);

// Mix and apply envelope
process = (osc1 + osc2) * myenv * gain;