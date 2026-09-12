import("stdfaust.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 1.2, 0, 5, 0.01);
det = 1.008;
saws = (os.sawtooth(freq) + os.sawtooth(freq * det) + os.sawtooth(freq / det) + os.square(freq * 0.5) * 0.25) / 3.2;
env = en.adsr(0.015, 0.15, 0.8, 0.3, gate);
fenv = en.adsr(0.01, 0.2, 0.6, 0.2, gate);
cutoff = 300 + 4000 * fenv;
sat(x) = x / (1.0 + abs(x));
process = sat((saws : fi.resonlp(cutoff, 2, 1)) * env * gain * 1.8) * 1.2;

echotime = hslider("echotime", 0.36, 0.02, 1.2, 0.001);
echofb = hslider("echofb", 0.5, 0, 0.95, 0.01);
echomix = hslider("echomix", 0.8, 0, 1, 0.01);
echo = + ~ (de.fdelay(131072, echotime * ma.SR) : *(echofb));
effect = _ <: _, (echo : *(echomix)) :> _;