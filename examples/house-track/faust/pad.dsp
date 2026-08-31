import("stdfaust.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);
det = 1.004;
saws = (os.sawtooth(freq) + os.sawtooth(freq * det) + os.sawtooth(freq / det)) / 3;
env = en.adsr(0.02, 0.15, 0.7, 0.15, gate);
process = (saws : fi.lowpass(2, 2200)) * env * gain * 0.5;