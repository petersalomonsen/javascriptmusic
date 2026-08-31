import("stdfaust.lib");
freq = hslider("freq", 8000, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);
process = (no.noise : fi.highpass(4, 7000)) * en.ar(0.001, 0.05, gate) * gain;