// Instrument-kind guides: what the instrument specialist is handed on top of the
// instrument section, chosen by the `kind` the producer names in
// design_instrument. Deliberately short — the specialist's prompt is assembled
// per task and thrown away, so a guide costs tokens only while that one
// instrument is being built, and nothing here ever enters the producer's
// context. Keep each guide to facts a specialist would otherwise have to
// rediscover; taste stays with the user.

export const INSTRUMENT_GUIDES = {
  fm: `### Guide: FM and legacy DX7 sounds
- Start from examples/dx7/dsp/epiano.dsp (read it — it is ~95 lines): the patch's values as constants, \`op(i, phase_mod) = dx.operator(...)\` with the argument order fixed by operator.lib, \`feedbackAmp = dx.fdbkscalef(feedback)\`, and the algorithm's routing in \`process\`. Copy it as the new instrument and change values; keep \`freq\`/\`gate\`/\`gain\` exactly as declared.
- What the numbers do: a MODULATOR's outLevel is brightness/harshness (raise for edge, lower for mellow); a CARRIER's outLevel is loudness; freqCoarse is the operator's ratio to the note (1 = fundamental, 2 = octave, 14 = the classic e-piano tine); EG rates R1..R4 are attack/decay/sustain-decay/release SPEEDS (99 = instant), EG levels L1..L4 the target levels (L4 = 0 so notes end); feedback (0-7) adds saw-like buzz to the operator that feeds itself; detune (-7..7) on one of two carriers gives chorus width.
- Keep the algorithm routing you copied unless you know another one from Faust's dx7.lib; a wrong routing silently changes which operators modulate which.
- A real ROM patch is imported by the USER with \`node examples/dx7/parse-rom.js <rom.syx> <patch> --dsp\` (examples/dx7/README.md) — you cannot run it; if the brief names a ROM patch, say so and build the closest thing from epiano.dsp.
- Verify with probe_instrument on at least two notes: an FM sound has a spectral centroid well above the fundamental; a centroid at the fundamental means every modulator is silent.`,

  subtractive: `### Guide: subtractive (analog-style) basses, leads and pads
- Shape: detuned oscillators (\`os.sawtooth(freq) + os.sawtooth(freq*1.005)\`, or \`os.square\`), an optional sub (\`os.osc(freq/2)\`), a resonant low-pass (\`fi.resonlp(cutoff, q, 1)\`) with the cutoff driven by its own envelope (\`cutoffBase + env * cutoffRange\`, env = \`en.adsr(...)\`), an amplitude \`en.adsr(a, d, s, r, gate)\`, then gentle warmth (\`ma.tanh\` or \`x/(1+abs(x))\`) and the level factor LAST so it does not change how hard the signal clips.
- Bass: cutoff 200-800 Hz with a fast decay, release short, one octave down via \`freq/2\` if the brief wants weight. Lead: brighter cutoff, a little detune, longer release. Pad: slow attack (0.3-1 s), long release, wide detune, cutoff modulated slowly by \`os.osc(0.2)\`.
- Any control the user should be able to AUTOMATE from the song becomes an \`hslider\` (it turns into a channel field reachable by CC/NRPN and the transpiler then emits a \`<Name>Channel\` class — import it only if write_faust reports it); everything else stays a constant.
- Verify with probe_instrument: two notes must differ in dominant frequency (it tracks the note), and the centroid should drop as the envelope closes.`,

  drums: `### Guide: drums and percussion
- ONE .dsp per drum (faust/kick.dsp, faust/snare.dsp, faust/hihat.dsp), each on its OWN channel. A single voice cannot map notes to drums unless it branches on \`freq\`, so do not promise a kit on one channel.
- Use ONE-SHOT envelopes: \`en.ar(attack, release, gate)\` plays attack then release once per trigger whatever the note length, which is what a hit wants; \`en.adsr\`/\`en.asr\` would hold the sound for as long as the note is held.
- Kick: a sine whose pitch sweeps down (\`os.osc(f0 * (1 + 4*en.ar(0.001, 0.08, gate)))\`, f0 ≈ 50 Hz) times \`en.ar(0.001, 0.3, gate)\`, a touch of \`ma.tanh\` for click and body; ignore \`freq\` or use it only to nudge f0. Snare: a tone burst (\`os.osc(180)\`) plus band-passed noise (\`no.noise : fi.bandpass(2, 1500, 6000)\`) each with its own short \`en.ar\`. Hi-hat: \`no.noise : fi.highpass(4, 7000)\` times \`en.ar(0.001, 0.05, gate)\` for closed, a longer release (0.3) for open.
- Velocity is linear gain (velocity/127): ghost notes sit near 25-45, accents near 100-127; do not scale gain again in the DSP unless the brief asks for a compressed feel.
- Verify with probe_instrument: a kick has its centroid near 60-150 Hz, a hi-hat above 8 kHz, a snare in between with a clear noise component; two notes on the same drum returning the same spectrum is CORRECT here.`,
};

// What the MASTERING specialist is handed on top of the mastering section: the
// measurement → move table, so an iteration is a lookup rather than a guess.
export const MASTERING_GUIDE = `### Guide: reading probe_mix and choosing the move
auto_master owns the arithmetic — gainDb, limiterCeilingDb, lowMonoHz — and reports why it stopped; do not hand-tune those. Your moves answer what it leaves, one or two per round, then auto_master again:
- auto_master stopped with "gainDb is at its limit" → the source mix is too quiet or too hot: change the channel levels in the song (CC 7) by the missing amount, not the master.
- "the loudness gap stopped shrinking" → the compressor absorbs the gain: raise the three thresholds by 6 dB (less compression) or, if the brief wants density, lower them and accept a lower PLR.
- clipped samples > 0 after auto_master → a channel clips BEFORE the chain: find the hot channel (grep_song for its track, CC 7) and lower it in the song.
- loudness range > 15 LU and the piece is not meant to be that dynamic → compRatio 3 and thresholds −24, or lift the quiet part's channel with CC 7.
- PLR under 6 dB → squashed: raise the thresholds, compRatio toward 1.5, gainDb down.
- low-end correlation under 0.8 → lowMonoHz 100–150.
- tilt above −3.5 dB/oct (harsh) → tiltDb −1..−2, or highThresholdDb −24; tilt below −8 (dull) → tiltDb +1..+2.
- sub band above −6 dB of the total → highpassHz 30–40, lowThresholdDb −24.
- a section more than 8 LU under the rest that is not a breakdown → raise that part's channel (CC 7) in the song, not the master.
- L/R balance beyond 1.5 dB → a pan (CC 10) problem in the song; note it, fix it only if the brief allows.
Defaults are a gentle 2:1 three-band compressor at −18 dB thresholds and a −1.2 dB ceiling; a typical streaming master needs gainDb between +3 and +9 on top of that. Never leave bypass = 1. Verify with probe_mix after every compile; the report's before/after lines are copied from it.`;

const SYNONYMS = [
  [/(^|\b)(fm|dx7|dx-7|yamaha|e\.?piano|epiano|bell|tine)(\b|$)/i, 'fm'],
  [/(^|\b)(drum|drums|kick|snare|hi-?hat|hat|percussion|clap|tom)(\b|$)/i, 'drums'],
  [/(^|\b)(subtractive|analog|analogue|saw|bass|lead|pad|synth|juno|moog|303|acid)(\b|$)/i, 'subtractive'],
];

/** The guide for a kind (or a free-text description of the sound), or '' if none applies. */
export function guideFor(kind) {
  const k = String(kind || '').trim();
  if (!k) return '';
  if (INSTRUMENT_GUIDES[k.toLowerCase()]) return INSTRUMENT_GUIDES[k.toLowerCase()];
  for (const [re, name] of SYNONYMS) if (re.test(k)) return INSTRUMENT_GUIDES[name];
  return '';
}
