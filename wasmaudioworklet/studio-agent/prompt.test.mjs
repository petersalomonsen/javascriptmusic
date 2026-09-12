// The system prompt is a core plus one section per object kind (sequence,
// instrument, mix, shader). These tests pin the contract the consumers rely
// on: the default build includes everything, a partial build keeps the core
// and drops only what was not asked for, and no section leaks another's
// domain-specific rules into the core.
//
// Run with: npm run test-agent-tools

import { test } from 'node:test';
import assert from 'node:assert';
import { SYSTEM_PROMPT, SECTIONS, SECTION_NAMES, buildSystemPrompt, SDK_PROMPT_SUFFIX, MASTERING_GUIDE } from './prompt.js';

test('the default build is the everything-included prompt', () => {
  assert.equal(buildSystemPrompt(), SYSTEM_PROMPT);
  assert.deepEqual(SECTION_NAMES, ['sequence', 'instrument', 'mix', 'mastering', 'shader']);
  for (const name of SECTION_NAMES) assert.ok(SYSTEM_PROMPT.includes(SECTIONS[name]), `${name} section present`);
});

test('the prompt opens with the identity line the proxy tests key on', () => {
  assert.ok(SYSTEM_PROMPT.startsWith('You are the Studio Agent for "WebAssembly Music"'));
  assert.ok(SYSTEM_PROMPT.trimEnd().endsWith('The goal is music the user can immediately hear in their browser.'));
});

test('a partial build keeps the core and drops only the omitted sections', () => {
  const core = buildSystemPrompt({ sections: [] });
  assert.ok(core.includes('## SCOPE DISCIPLINE'));
  assert.ok(core.includes('## ASSURANCE'));
  assert.ok(core.includes('## Your tools'));
  assert.ok(core.includes('## How to work'));
  for (const name of SECTION_NAMES) assert.ok(!core.includes(SECTIONS[name]), `${name} absent from core`);

  const seq = buildSystemPrompt({ sections: ['sequence'] });
  assert.ok(seq.includes(SECTIONS.sequence));
  assert.ok(!seq.includes(SECTIONS.shader));
  assert.ok(seq.length < SYSTEM_PROMPT.length);
  // order is fixed regardless of how the caller lists them
  assert.equal(buildSystemPrompt({ sections: ['shader', 'sequence'] }), buildSystemPrompt({ sections: ['sequence', 'shader'] }));
  // unknown names are ignored, not an error
  assert.equal(buildSystemPrompt({ sections: ['nope'] }), core);
});

test('each section owns its domain: headers live in exactly one place', () => {
  const owner = { '## SONG format': 'sequence', '## run_script': 'sequence', '## Editing recorded performances': 'sequence',
    '## Authoring an instrument in FAUST': 'instrument', '### Legacy synths': 'instrument',
    '## synth.ts is ONLY the multitimbral combiner': 'mix', '## Adding a voice/channel to a LARGE existing synth': 'mix',
    '## Mastering the mix': 'mastering',
    '## The visualizer shader': 'shader' };
  for (const [header, name] of Object.entries(owner)) {
    for (const other of SECTION_NAMES) {
      assert.equal(SECTIONS[other].includes(header), other === name, `${header} in ${other}`);
    }
    assert.ok(!buildSystemPrompt({ sections: [] }).includes(header), `${header} not in core`);
  }
});

test('patch data is not sent from the song any more', () => {
  // The legacy NRPN-in-song model must not be taught anywhere as the way to do it.
  assert.ok(!SYSTEM_PROMPT.includes('every channel\'s patch comes from the SONG'));
  assert.ok(!SYSTEM_PROMPT.includes('Add its NRPN patch block'));
  assert.ok(SECTIONS.instrument.includes('Patch data never goes in the song'));
  assert.ok(SECTIONS.instrument.includes('examples/dx7/dsp/epiano.dsp'));
});

test('the SDK suffix is separate from the shared prompt', () => {
  assert.ok(SDK_PROMPT_SUFFIX.includes('mcp__studio__'));
  assert.ok(!SYSTEM_PROMPT.includes('mcp__studio__'));
});

// ---- producer + specialist ---------------------------------------------------
import { buildProducerPrompt, buildSpecialistPrompt, INSTRUMENT_GUIDES, guideFor } from './prompt.js';
import { SPECIALIST_REPORT_FORMAT, MASTERING_REPORT_FORMAT } from './tools-core.js';

test('the producer delegates instrument design and never holds the instrument section', () => {
  const p = buildProducerPrompt();
  assert.ok(!p.includes(SECTIONS.instrument));
  assert.ok(p.includes(SECTIONS.sequence) && p.includes(SECTIONS.mix) && p.includes(SECTIONS.shader));
  assert.ok(p.includes('- design_instrument('), 'the tool list names design_instrument');
  assert.ok(!p.includes('- write_faust('), 'the tool list no longer offers write_faust');
  // No sentence left that tells the producer to author DSP itself.
  assert.ok(!/author it with write_faust|you write the \.dsp files|author it in Faust\)/.test(p));
  assert.ok(p.includes('delegated with `design_instrument`'));
  // The delegated core is otherwise the same core: scope and assurance intact.
  assert.ok(p.includes('## SCOPE DISCIPLINE') && p.includes('## ASSURANCE') && p.includes('## How to work'));
  assert.ok(p.length < SYSTEM_PROMPT.length);
});

test('the delegated rewrites fail loudly when the core drifts', () => {
  // buildSystemPrompt throws rather than silently producing a producer that is
  // still told to write .dsp files — pinned by calling the builder on a prompt
  // whose core lacks a rewrite target.
  assert.doesNotThrow(() => buildProducerPrompt());
  assert.throws(() => buildSpecialistPrompt('shader'), /unknown specialist role/);
});

test('the specialist prompt is head + assurance + instrument + mix + guide, and nothing about the song', () => {
  const sp = buildSpecialistPrompt('instrument', { kind: 'fm' });
  assert.ok(sp.startsWith('You are the INSTRUMENT SPECIALIST'));
  assert.ok(sp.includes('## ASSURANCE'));
  assert.ok(sp.includes(SECTIONS.instrument) && sp.includes(SECTIONS.mix));
  assert.ok(sp.includes(INSTRUMENT_GUIDES.fm));
  assert.ok(sp.includes(SPECIALIST_REPORT_FORMAT));
  assert.ok(!sp.includes('## SONG format') && !sp.includes('## The visualizer shader') && !sp.includes('## SCOPE DISCIPLINE'));
  // no guide for an unknown kind, and a bespoke guide can be passed in
  assert.ok(!buildSpecialistPrompt('instrument', { kind: 'theremin' }).includes('### Guide:'));
  assert.ok(buildSpecialistPrompt('instrument', { guide: '### Guide: custom\nx' }).includes('### Guide: custom'));
  // the specialist never gets the producer-only delegation tool
  assert.ok(!sp.includes('design_instrument'));
});

test('guides resolve by kind and by a description of the sound', () => {
  assert.equal(guideFor('fm'), INSTRUMENT_GUIDES.fm);
  assert.equal(guideFor('DX7 e-piano'), INSTRUMENT_GUIDES.fm);
  assert.equal(guideFor('closed hi-hat'), INSTRUMENT_GUIDES.drums);
  assert.equal(guideFor('analog bass'), INSTRUMENT_GUIDES.subtractive);
  assert.equal(guideFor(''), '');
  assert.equal(guideFor('theremin'), '');
  for (const [name, text] of Object.entries(INSTRUMENT_GUIDES)) {
    assert.ok(text.startsWith('### Guide:'), name);
    assert.ok(text.length < 2500, `${name} guide should stay short (${text.length})`);
    assert.ok(text.includes('probe_instrument'), `${name} guide says how to verify`);
  }
});

test('the mastering specialist prompt is its head + assurance + mix + mastering + the move table, and nothing about the song', () => {
  const sp = buildSpecialistPrompt('mastering');
  assert.ok(sp.startsWith('You are the MASTERING SPECIALIST'));
  assert.ok(sp.includes('## ASSURANCE'));
  assert.ok(sp.includes(SECTIONS.mix) && sp.includes(SECTIONS.mastering));
  assert.ok(sp.includes(MASTERING_GUIDE) && sp.includes(MASTERING_REPORT_FORMAT));
  assert.ok(!sp.includes(SECTIONS.instrument) && !sp.includes('## SONG format') && !sp.includes('## The visualizer shader'));
  // it never gets the producer-only delegation tools
  assert.ok(!sp.includes('design_instrument') && !sp.includes('master_mix'));
  assert.ok(buildSpecialistPrompt('mastering', { guide: '### Guide: custom\nx' }).includes('### Guide: custom'));
});

test('the producer delegates mastering: it has the tools, not the section', () => {
  const p = buildProducerPrompt();
  assert.ok(!p.includes(SECTIONS.mastering));
  assert.ok(!p.includes('## Mastering the mix'));
  assert.ok(p.includes('- probe_mix(') && p.includes('- master_mix('));
  assert.ok(/5\. \*\*probe_mix\*\*/.test(p), 'probe_mix has its rung on the assurance ladder');
});
