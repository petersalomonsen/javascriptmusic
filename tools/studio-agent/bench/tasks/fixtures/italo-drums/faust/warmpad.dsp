import("stdfaust.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.5, 0, 1, 0.01);
det = 0.005;
saws = (os.sawtooth(freq) + os.sawtooth(freq*(1.0+det)) + os.sawtooth(freq*(1.0-det))) / 3.0;
env = en.adsr(0.06, 0.4, 0.78, 0.5, gate);
cutoff = 850.0;
process = (saws : fi.lowpass(4, cutoff)) * env * gain * 1.3;