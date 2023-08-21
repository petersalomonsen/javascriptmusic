export const songsource = /*javascript*/`
global.bpm = 120;
global.pattern_size_shift = 4;

const sointukick = {
            "numvoices": 1,
            "units": [
              {
                type: "envelope",
                id: 'env',
                parameters: { attack: 5, decay: 64,gain: 100,release: 64, stereo: 0,sustain: 0 }
              },
              {
                type: 'send',
          		parameters: {amount: 128, port: 4, sendpop: 0, stereo: 0, target: 'env'}
              },
              {
                type: "envelope",
                parameters: { attack: 0, decay: 70,gain: 115,release: 0, stereo: 0,sustain: 0 }
              },
              {
                type: 'distort',
          		parameters: {drive: 32, stereo: 0}
              },
              {
                type: 'send',
          		parameters: {amount: 128, port: 1, sendpop: 0, stereo: 0, target: 'osc'}
              },
              {
              	type: 'pop',
          		parameters: {stereo: 0}
              },
              {
              	type: 'oscillator', id: 'osc', parameters: {color: 64, detune: 55, gain: 45, lfo: 0, phase: 0, shape: 96, stereo: 0, transpose: 46, type: 1, unison: 1}
              },
              {
                type: 'mulp',
          		parameters: {stereo: 0}
              },
              { type: 'filter', parameters: {lowpass: 1, frequency: 30, resonance: 128}},
              {
        	      type: 'loadnote',
		          parameters: {stereo: 0}
              },
              {
                type: 'mulp',
          		parameters: {stereo: 0}
              },
              {
              	type: 'pan',
          		parameters: {panning: 64, stereo: 0}
              },
              { type: 'outaux', parameters: {outgain: 102, auxgain: 18, stereo: 1}},
              {type: "loadnote"},{ type: "envelope", parameters: {attack: 0, gain: 128, stereo: 0, decay: 80, sustain: 0, release: 80}},{type: "mulp"},{ type: "sync", parameters: {}},{ type: "pop", parameters: {}}
            ]
          };


addInstrument('kick', {type: 'number', sointu: sointukick});

addInstrument('hihat', {type: 'number', sointu: {
  "numvoices": 1,
  "units": [
    { type: "envelope", parameters: { attack: 0, decay: 64,gain: 76,release: 32, stereo: 0,sustain: 15 } },
    { type: "noise", parameters: { gain: 128, shape: 64, stereo: 00 } },    
    { type: 'mulp', parameters: {stereo: 0}},
    { type: 'filter', parameters: {bandpass: 1, frequency: 128, highpass: 
0, lowpass: 0, negbandpass: 0, neghighpass: 0, resonance: 128, stereo: 
0}},
    { type: 'loadnote', parameters: {stereo: 0}},
    { type: 'mulp', parameters: {stereo: 0}},
    { type: 'pan', parameters: {panning: 64, stereo: 0} },
   	{ type: 'outaux', parameters: {outgain: 100, auxgain: 100, stereo: 1}},
    {type: "loadnote"},{ type: "envelope", parameters: {attack: 0, gain: 128, stereo: 0, decay: 80, sustain: 0, release: 80}},{type: "mulp"},{ type: "sync", parameters: {}},{ type: "pop", parameters: {}}
  ]
}});

const bass = {type: 'note', sointu: {
  "numvoices": 1,
  "units": [
    { type: "envelope", id: 'env', parameters: { attack: 32, decay: 76,gain: 55,release: 75, stereo: 0,sustain: 28 } },
    { type: 'oscillator', parameters: {color: 90, detune: 64, gain: 128,  lfo: 0, phase: 32, shape: 96, stereo: 0, transpose: 76, type: 2, unison: 0}},
    { type: 'mulp', parameters: {stereo: 0}},
    { type: 'filter', parameters: {lowpass: 1, frequency: 20, resonance: 128}},
    { type: 'pan', parameters: {panning: 64, stereo: 0} },
    { type: 'outaux', parameters: {outgain: 100, auxgain: 10, stereo: 1}},
    {type: "loadnote"},{ type: "envelope", parameters: {attack: 0, gain: 128, stereo: 0, decay: 80, sustain: 0, release: 80}},{type: "mulp"},{ type: "sync", parameters: {}},{ type: "pop", parameters: {}}
  ]
	}
};
addInstrument('bass_1', bass);
addInstrument('bass_2', bass);
addInstrumentGroup('bass', ['bass_1','bass_2']);

addInstrument('Global', {type: 'number', sointu: {

  "numvoices": 1,
  "units": [
    {type: 'in', parameters: {channel: 2, stereo: 1}},
   	{ type: 'delay',
          parameters: {damp: 64, dry: 128, feedback: 125, notetracking: 0, pregain: 30, stereo: 0},
          varargs: [1116, 1188, 1276, 1356, 1422, 1492, 1556, 1618]
    },
    { 
      type: 'outaux', parameters: {auxgain: 0, outgain: 128, stereo: 1}
	},
    {type: 'in', parameters: {channel: 4, stereo: 1}},
    { type: 'delay',
          parameters: {damp: 64, dry: 64, feedback: 64, notetracking: 0, pregain: 53, stereo: 0},
          varargs: [16537, 16537]
	},
    { 
      type: 'outaux', parameters: {auxgain: 0, outgain: 128, stereo: 1}
	},
    {type: 'in', parameters: {channel: 0, stereo: 1}},
    {type: 'push', parameters: {channel: 0, stereo: 1}},
    {type: 'filter', parameters: {bandpass: 0, frequency: 32, highpass: 1, lowpass: 0, negbandpass: 0, neghighpass: 0, resonance: 128, stereo: 1}},
    {type: 'compressor', parameters: {attack: 16, invgain: 90, ratio: 20, release: 54, stereo: 1, threshold: 50}},
    {type: 'mulp',parameters: {stereo: 1}},
	{type: 'xch',parameters: {stereo: 1}},
    {type: 'filter', parameters: {bandpass: 0, frequency: 7, highpass: 1, lowpass: 0, negbandpass: 0, neghighpass: 0, resonance: 128, stereo: 1}},
    {type: 'compressor', parameters: {attack: 8, invgain: 80, ratio: 10, release: 64, stereo: 1, threshold: 40}},
    {type: 'mulp', parameters: {stereo: 1}},
    {type: 'addp',parameters: {stereo: 1}},
    { 
      type: 'outaux', parameters: {auxgain: 0, outgain: 128, stereo: 1}
	}
  ]
}});


playPatterns({
	bass: pp(4, [
      e2,,,e2,
      ,[,e2],,d3,
	  [,e3],,,a2,
  		,,[,b2],,
    ],2),
  	kick: pp(4, [
    	70,0,0,0,
      70,0,0,0,
      70,0,0,0,
      70,0,0,0
    ]),
      hihat: pp(4, [
    	0,0,60,0,
      0,0,60,0,
      0,0,60,0,
      0,0,60,70
    ])
},1);
`;

export const expectedYaml = `bpm: 120
rowsperbeat: 4
createemptypatterns: true
wasmdisablerenderonstart: true
score:
  length: 1
  rowsperpattern: 16
  tracks:
    - numvoices: 1
      order:
        - 0
      patterns:
        - - 70
          - 0
          - 0
          - 0
          - 70
          - 0
          - 0
          - 0
          - 70
          - 0
          - 0
          - 0
          - 70
          - 0
          - 0
          - 0
    - numvoices: 1
      order:
        - 0
      patterns:
        - - 0
          - 0
          - 60
          - 0
          - 0
          - 0
          - 60
          - 0
          - 0
          - 0
          - 60
          - 0
          - 0
          - 0
          - 60
          - 70
    - numvoices: 1
      order:
        - 0
      patterns:
        - - 28
          - 0
          - 0
          - 28
          - 0
          - 0
          - 0
          - 38
          - 0
          - 0
          - 0
          - 33
          - 0
          - 0
          - 0
          - 0
    - numvoices: 1
      order:
        - 0
      patterns:
        - - 0
          - 0
          - 0
          - 0
          - 0
          - 28
          - 0
          - 0
          - 40
          - 0
          - 0
          - 0
          - 0
          - 0
          - 35
          - 0
    - numvoices: 1
      order:
        - 0
      patterns:
        - - 0
          - 0
          - 0
          - 0
          - 0
          - 0
          - 0
          - 0
          - 0
          - 0
          - 0
          - 0
          - 0
          - 0
          - 0
          - 0
patch:
  - numvoices: 1
    units:
      - type: envelope
        id: 1
        parameters:
          attack: 5
          decay: 64
          gain: 100
          release: 64
          stereo: 0
          sustain: 0
      - type: send
        parameters:
          amount: 128
          port: 4
          sendpop: 0
          stereo: 0
          target: 1
        id: 2
      - type: envelope
        parameters:
          attack: 0
          decay: 70
          gain: 115
          release: 0
          stereo: 0
          sustain: 0
        id: 3
      - type: distort
        parameters:
          drive: 32
          stereo: 0
        id: 4
      - type: send
        parameters:
          amount: 128
          port: 1
          sendpop: 0
          stereo: 0
          target: 7
        id: 5
      - type: pop
        parameters:
          stereo: 0
        id: 6
      - type: oscillator
        id: 7
        parameters:
          color: 64
          detune: 55
          gain: 45
          lfo: 0
          phase: 0
          shape: 96
          stereo: 0
          transpose: 46
          type: 1
          unison: 1
      - type: mulp
        parameters:
          stereo: 0
        id: 8
      - type: filter
        parameters:
          lowpass: 1
          frequency: 30
          resonance: 128
        id: 9
      - type: loadnote
        parameters:
          stereo: 0
        id: 10
      - type: mulp
        parameters:
          stereo: 0
        id: 11
      - type: pan
        parameters:
          panning: 64
          stereo: 0
        id: 12
      - type: outaux
        parameters:
          outgain: 102
          auxgain: 18
          stereo: 1
        id: 13
      - type: loadnote
        id: 14
      - type: envelope
        parameters:
          attack: 0
          gain: 128
          stereo: 0
          decay: 80
          sustain: 0
          release: 80
        id: 15
      - type: mulp
        id: 16
      - type: sync
        parameters: {}
        id: 17
      - type: pop
        parameters: {}
        id: 18
  - numvoices: 1
    units:
      - type: envelope
        parameters:
          attack: 0
          decay: 64
          gain: 76
          release: 32
          stereo: 0
          sustain: 15
        id: 19
      - type: noise
        parameters:
          gain: 128
          shape: 64
          stereo: 0
        id: 20
      - type: mulp
        parameters:
          stereo: 0
        id: 21
      - type: filter
        parameters:
          bandpass: 1
          frequency: 128
          highpass: 0
          lowpass: 0
          negbandpass: 0
          neghighpass: 0
          resonance: 128
          stereo: 0
        id: 22
      - type: loadnote
        parameters:
          stereo: 0
        id: 23
      - type: mulp
        parameters:
          stereo: 0
        id: 24
      - type: pan
        parameters:
          panning: 64
          stereo: 0
        id: 25
      - type: outaux
        parameters:
          outgain: 100
          auxgain: 100
          stereo: 1
        id: 26
      - type: loadnote
        id: 27
      - type: envelope
        parameters:
          attack: 0
          gain: 128
          stereo: 0
          decay: 80
          sustain: 0
          release: 80
        id: 28
      - type: mulp
        id: 29
      - type: sync
        parameters: {}
        id: 30
      - type: pop
        parameters: {}
        id: 31
  - &ref_0
    numvoices: 1
    units:
      - type: envelope
        id: 43
        parameters:
          attack: 32
          decay: 76
          gain: 55
          release: 75
          stereo: 0
          sustain: 28
      - type: oscillator
        parameters:
          color: 90
          detune: 64
          gain: 128
          lfo: 0
          phase: 32
          shape: 96
          stereo: 0
          transpose: 76
          type: 2
          unison: 0
        id: 44
      - type: mulp
        parameters:
          stereo: 0
        id: 45
      - type: filter
        parameters:
          lowpass: 1
          frequency: 20
          resonance: 128
        id: 46
      - type: pan
        parameters:
          panning: 64
          stereo: 0
        id: 47
      - type: outaux
        parameters:
          outgain: 100
          auxgain: 10
          stereo: 1
        id: 48
      - type: loadnote
        id: 49
      - type: envelope
        parameters:
          attack: 0
          gain: 128
          stereo: 0
          decay: 80
          sustain: 0
          release: 80
        id: 50
      - type: mulp
        id: 51
      - type: sync
        parameters: {}
        id: 52
      - type: pop
        parameters: {}
        id: 53
  - *ref_0
  - numvoices: 1
    units:
      - type: in
        parameters:
          channel: 2
          stereo: 1
        id: 54
      - type: delay
        parameters:
          damp: 64
          dry: 128
          feedback: 125
          notetracking: 0
          pregain: 30
          stereo: 0
        varargs:
          - 1116
          - 1188
          - 1276
          - 1356
          - 1422
          - 1492
          - 1556
          - 1618
        id: 55
      - type: outaux
        parameters:
          auxgain: 0
          outgain: 128
          stereo: 1
        id: 56
      - type: in
        parameters:
          channel: 4
          stereo: 1
        id: 57
      - type: delay
        parameters:
          damp: 64
          dry: 64
          feedback: 64
          notetracking: 0
          pregain: 53
          stereo: 0
        varargs:
          - 16537
          - 16537
        id: 58
      - type: outaux
        parameters:
          auxgain: 0
          outgain: 128
          stereo: 1
        id: 59
      - type: in
        parameters:
          channel: 0
          stereo: 1
        id: 60
      - type: push
        parameters:
          channel: 0
          stereo: 1
        id: 61
      - type: filter
        parameters:
          bandpass: 0
          frequency: 32
          highpass: 1
          lowpass: 0
          negbandpass: 0
          neghighpass: 0
          resonance: 128
          stereo: 1
        id: 62
      - type: compressor
        parameters:
          attack: 16
          invgain: 90
          ratio: 20
          release: 54
          stereo: 1
          threshold: 50
        id: 63
      - type: mulp
        parameters:
          stereo: 1
        id: 64
      - type: xch
        parameters:
          stereo: 1
        id: 65
      - type: filter
        parameters:
          bandpass: 0
          frequency: 7
          highpass: 1
          lowpass: 0
          negbandpass: 0
          neghighpass: 0
          resonance: 128
          stereo: 1
        id: 66
      - type: compressor
        parameters:
          attack: 8
          invgain: 80
          ratio: 10
          release: 64
          stereo: 1
          threshold: 40
        id: 67
      - type: mulp
        parameters:
          stereo: 1
        id: 68
      - type: addp
        parameters:
          stereo: 1
        id: 69
      - type: outaux
        parameters:
          auxgain: 0
          outgain: 128
          stereo: 1
        id: 70
`;