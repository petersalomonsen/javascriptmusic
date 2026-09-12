import("stdfaust.lib");
freq = hslider("freq", 440, 20, 20000, 0.01);
gate = button("gate");
gain = hslider("gain", 0.8, 0, 1, 0.01);

// OB-Xa style: stacked detuned saws in unison + an octave-up saw for brightness
det = 0.006;
saws = (os.sawtooth(freq)
      + os.sawtooth(freq * (1.0 + det))
      + os.sawtooth(freq * (1.0 - det))
      + os.sawtooth(freq * 2.0) * 0.3) / 3.3;

// fast attack, brassy-but-quick filter swell
env  = en.adsr(0.008, 0.25, 0.82, 0.35, gate);
fenv = en.adsr(0.02, 0.30, 0.60, 0.30, gate);
cutoff = 500.0 + 5000.0 * fenv;

process = (saws : fi.resonlp(cutoff, 1.3, 1)) * env * gain * 0.5;

// light ensemble/chorus for width (channel effect)
lfo = 0.5 + 0.5 * os.osc(0.6);
chorus = _ <: _, (de.fdelay(4096, (0.008 + 0.004 * lfo) * ma.SR)) :> *(0.5);
effect = chorus;