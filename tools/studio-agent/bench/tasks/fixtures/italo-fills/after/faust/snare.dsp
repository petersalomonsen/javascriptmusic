import("stdfaust.lib");
freq = hslider("freq", 180, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.7, 0, 1, 0.01);
tone = (os.osc(freq) + os.osc(freq * 1.6)) * 0.5 * en.ar(0.001, 0.11, gate);
snap = (no.noise : fi.highpass(2, 1200)) * en.ar(0.001, 0.17, gate);
process = (tone * 0.5 + snap * 0.7) * gain;